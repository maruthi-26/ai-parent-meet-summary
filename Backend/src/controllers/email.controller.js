const prisma = require("../config/prisma");
const { createAuditLog } = require("../utils/logger");

const sendEmail = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { student: true },
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.aiSummary) {
      return res.status(400).json({ message: "Generate AI Summary first" });
    }

    // Update email status tracking in database
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    await createAuditLog(
      req.user.id,
      "MESSAGE_SENT",
      meeting.studentId,
      meetingId,
      { channel: "email" }
    );

    return res.json({
      success: true,
      message: "Email marked as sent in tracking",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendEmail,
};
