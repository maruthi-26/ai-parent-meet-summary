const prisma = require("../config/prisma");
const { createAuditLog } = require("../utils/logger");

const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      className,
      parentName,
      parentPhone,
      parentEmail,
      teacherId,
      gender,
    } = req.body;

    if (req.user.role === "ADMIN" && !teacherId) {
      return res.status(400).json({ message: "Teacher assignment is required for Admins" });
    }

    const student = await prisma.student.create({
      data: {
        name,
        className,
        parentName,
        parentPhone,
        parentEmail,
        gender,
        teacherId: req.user.role === "TEACHER" ? req.user.id : teacherId,
      },
    });

    await createAuditLog(
      req.user.id,
      "STUDENT_CREATED",
      student.id,
      null,
      { name, className }
    );

    return res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const queryOptions = {
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    // Filter by teacher if logged-in user is a teacher
    if (req.user.role === "TEACHER") {
      queryOptions.where = {
        teacherId: req.user.id,
      };
    }

    const students = await prisma.student.findMany(queryOptions);
    return res.json(students);
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      className,
      parentName,
      parentPhone,
      parentEmail,
      teacherId,
      gender,
    } = req.body;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Teacher can only edit their own students
    if (req.user.role === "TEACHER" && student.teacherId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own students" });
    }

    // Admin must assign a teacher
    if (req.user.role === "ADMIN" && !teacherId) {
      return res.status(400).json({ message: "Teacher assignment is required" });
    }

    const updateData = {
      name,
      className,
      parentName,
      parentPhone,
      parentEmail,
      gender,
    };

    if (req.user.role === "ADMIN") {
      updateData.teacherId = teacherId;
    }

    const updated = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await createAuditLog(
      req.user.id,
      "STUDENT_UPDATED",
      updated.id,
      null,
      { name: updated.name, className: updated.className }
    );

    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Teacher can only delete their own students
    if (req.user.role === "TEACHER" && student.teacherId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own students" });
    }

    // Delete associated Feedback first
    const meetings = await prisma.meeting.findMany({ where: { studentId: id } });
    const meetingIds = meetings.map((m) => m.id);
    if (meetingIds.length > 0) {
      await prisma.feedback.deleteMany({
        where: { meetingId: { in: meetingIds } },
      });
    }

    // Delete associated meetings
    await prisma.meeting.deleteMany({ where: { studentId: id } });

    // Delete student
    await prisma.student.delete({ where: { id } });

    await createAuditLog(
      req.user.id,
      "STUDENT_DELETED",
      id,
      null,
      { studentId: id }
    );

    return res.json({ message: "Student deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getStudentProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            gender: true,
          },
        },
        meetings: {
          orderBy: { createdAt: "desc" },
          include: {
            feedback: true,
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
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Teachers can only view their own students
    if (req.user.role === "TEACHER" && student.teacherId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Access to this student is restricted" });
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  getStudentProfile,
};