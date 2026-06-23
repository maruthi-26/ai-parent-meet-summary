const prisma = require("../config/prisma");
const { createAuditLog } = require("../utils/logger");

const sendWhatsApp = async (
  req,
  res,
  next
) => {
  try {
    const { meetingId } = req.params;

    const meeting =
      await prisma.meeting.findUnique({
        where: {
          id: meetingId,
        },
        include: {
          student: true,
        },
      });

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    if (!meeting.aiSummary) {
      return res.status(400).json({
        message:
          "Generate AI Summary first",
      });
    }

    // Later we'll call WhatsApp API here

    await prisma.meeting.update({
      where: {
        id: meetingId,
      },
      data: {
        whatsappSent: true,
        whatsappSentAt: new Date(),
      },
    });

    await createAuditLog(
      req.user.id,
      "MESSAGE_SENT",
      meeting.studentId,
      meetingId,
      { channel: "whatsapp" }
    );

    return res.json({
      success: true,
      message:
        "WhatsApp sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendWhatsApp,
};