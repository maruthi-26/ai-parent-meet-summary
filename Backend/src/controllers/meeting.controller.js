const prisma = require("../config/prisma");
const { createAuditLog } = require("../utils/logger");

const createMeeting = async (req, res, next) => {
  try {
    const {
      teacherId,
      studentId,
      notes,
      meetingDate,
      meetingTime,
      meetingStatus,
    } = req.body;

    const finalTeacherId = req.user.role === "TEACHER" ? req.user.id : (teacherId || req.user.id);

    const meeting =
      await prisma.meeting.create({
        data: {
          teacherId: finalTeacherId,
          studentId,
          notes,
          meetingDate,
          meetingTime,
          meetingStatus: meetingStatus || "Scheduled",
        },
      });

    await createAuditLog(
      req.user.id,
      "MEETING_CREATED",
      studentId,
      meeting.id,
      { notesSnippet: notes ? notes.substring(0, 100) : "" }
    );

    res.status(201).json(meeting);
  } catch (error) {
    next(error);
  }
};

const getMeetings = async (req, res, next) => {
  try {
    const queryOptions = {
      include: {
        student: true,
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    // Filter by teacher if logged-in user is a teacher
    if (req.user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { id: req.user.id }
      });
      const teacherClasses = teacher?.classes
        ? teacher.classes.split(",").map(c => c.trim()).filter(Boolean)
        : [];

      if (teacherClasses.length > 0) {
        queryOptions.where = {
          OR: [
            { teacherId: req.user.id },
            { student: { className: { in: teacherClasses } } }
          ]
        };
      } else {
        queryOptions.where = {
          teacherId: req.user.id,
        };
      }
    }

    const meetings = await prisma.meeting.findMany(queryOptions);
    res.json(meetings);
  } catch (error) {
    next(error);
  }
};

const rateMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const { rating } = req.body;

    if (rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const meeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: { satisfactionRating: parseInt(rating, 10) },
    });

    await createAuditLog(
      req.user.id,
      "FEEDBACK_ADDED",
      meeting.studentId,
      meeting.id,
      { rating }
    );

    res.json(meeting);
  } catch (error) {
    next(error);
  }
};

const getMeetingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            className: true,
            parentName: true,
            parentPhone: true,
            parentEmail: true,
            gender: true,
            riskLevel: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            role: true,
            gender: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          include: {
            teacher: {
              select: {
                name: true,
              },
            },
          },
        },
        feedback: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Teachers can only view meetings of their own students or class
    if (req.user.role === "TEACHER" && meeting.teacherId !== req.user.id) {
      const teacher = await prisma.teacher.findUnique({ where: { id: req.user.id } });
      const teacherClasses = teacher?.classes
        ? teacher.classes.split(",").map(c => c.trim()).filter(Boolean)
        : [];
      if (!teacherClasses.includes(meeting.student.className)) {
        return res.status(403).json({ message: "Forbidden: Access to this meeting is restricted" });
      }
    }

    res.json(meeting);
  } catch (error) {
    next(error);
  }
};

const updateMeetingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, aiSummary, satisfactionRating, meetingDate, meetingTime, meetingStatus } = req.body;

    const existing = await prisma.meeting.findUnique({
      where: { id },
      select: { teacherId: true, studentId: true, meetingStatus: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (req.user.role === "TEACHER" && existing.teacherId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own meetings" });
    }

    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (aiSummary !== undefined) updateData.aiSummary = aiSummary;
    if (satisfactionRating !== undefined) updateData.satisfactionRating = parseInt(satisfactionRating, 10);
    if (meetingDate !== undefined) updateData.meetingDate = meetingDate;
    if (meetingTime !== undefined) updateData.meetingTime = meetingTime;
    if (meetingStatus !== undefined) updateData.meetingStatus = meetingStatus;

    const updated = await prisma.meeting.update({
      where: { id },
      data: updateData,
    });

    if (meetingStatus !== undefined && meetingStatus !== existing.meetingStatus) {
      await createAuditLog(
        req.user.id,
        "STATUS_UPDATED",
        existing.studentId,
        id,
        { from: existing.meetingStatus, to: meetingStatus }
      );
    } else {
      await createAuditLog(
        req.user.id,
        "MEETING_UPDATED",
        existing.studentId,
        id,
        { updatedFields: Object.keys(updateData) }
      );
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  rateMeeting,
  getMeetingById,
  updateMeetingDetails,
};

