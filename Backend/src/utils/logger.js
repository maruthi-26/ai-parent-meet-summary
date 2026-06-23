const prisma = require("../config/prisma");

const createAuditLog = async (teacherId, action, studentId = null, meetingId = null, details = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        teacherId,
        studentId,
        meetingId,
        action,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};

module.exports = { createAuditLog };
