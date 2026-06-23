const prisma = require("../config/prisma");
const { createAuditLog } = require("../utils/logger");

const submitFeedback = async (req, res, next) => {
  try {
    const { meetingId } = req.body;
    const rating = parseInt(req.body.rating, 10);
    const { satisfactionLevel, comment } = req.body;

    if (!meetingId) {
      return res.status(400).json({ error: "meetingId is required" });
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    if (!satisfactionLevel) {
      return res.status(400).json({ error: "satisfactionLevel is required" });
    }

    // Check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Determine sentiment deterministically
    let sentiment = "Neutral";
    if (rating >= 4) {
      sentiment = "Positive";
    } else if (rating <= 2) {
      sentiment = "Negative";
    }

    // Determine status update
    let newStatus = meeting.meetingStatus;
    if (rating >= 4) {
      newStatus = "Closed";
    } else if (rating <= 2) {
      newStatus = "Follow-Up Required";
    }

    // Create or update feedback
    const feedback = await prisma.feedback.upsert({
      where: { meetingId },
      update: {
        rating,
        satisfactionLevel,
        comment,
        sentiment,
      },
      create: {
        meetingId,
        rating,
        satisfactionLevel,
        comment,
        sentiment,
      },
    });

    // Update meeting status and old satisfactionRating
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        meetingStatus: newStatus,
        satisfactionRating: rating,
      },
    });

    // Create Audit Log for Feedback Submitted
    await createAuditLog(
      meeting.teacherId,
      "FEEDBACK_SUBMITTED",
      meeting.studentId,
      meetingId,
      { rating, satisfactionLevel, sentiment }
    );

    // If status changed, create Status Updated Audit Log
    if (newStatus !== meeting.meetingStatus) {
      await createAuditLog(
        meeting.teacherId,
        "STATUS_UPDATED",
        meeting.studentId,
        meetingId,
        { from: meeting.meetingStatus, to: newStatus, trigger: "feedback_submission" }
      );
    }

    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

const getFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        meeting: {
          include: {
            student: true,
            teacher: {
              select: { name: true, id: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(feedbacks);
  } catch (error) {
    next(error);
  }
};

const getFeedbackByMeetingId = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            className: true,
            parentName: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        feedback: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    res.json({
      meeting,
      feedback: meeting.feedback,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getFeedbacks,
  getFeedbackByMeetingId,
};
