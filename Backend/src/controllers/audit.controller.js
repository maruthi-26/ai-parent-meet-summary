const prisma = require("../config/prisma");

const getAuditLogs = async (req, res, next) => {
  try {
    const queryOptions = {
      include: {
        teacher: { select: { id: true, name: true, role: true } },
        student: { select: { id: true, name: true } },
        meeting: { select: { id: true, notes: true } },
      },
      orderBy: { createdAt: "desc" },
    };

    // Teachers can only view their own logs
    if (req.user.role === "TEACHER") {
      queryOptions.where = {
        teacherId: req.user.id,
      };
    }

    const logs = await prisma.auditLog.findMany(queryOptions);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
