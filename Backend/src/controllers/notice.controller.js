const prisma = require("../config/prisma");

// GET all notices
const getNotices = async (req, res, next) => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
    res.json(notices);
  } catch (error) {
    next(error);
  }
};

// GET single notice
const getNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notice = await prisma.notice.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.json(notice);
  } catch (error) {
    next(error);
  }
};

// CREATE notice
const createNotice = async (req, res, next) => {
  try {
    const { title, content, targetAudience = "ALL" } = req.body;
    const teacherId = req.teacher?.id || req.user?.id;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const notice = await prisma.notice.create({
      data: { title, content, targetAudience, createdById: teacherId },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    res.status(201).json(notice);
  } catch (error) {
    next(error);
  }
};

// DELETE notice
const deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.notice.delete({ where: { id } });
    res.json({ success: true, message: "Notice deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotices, getNotice, createNotice, deleteNotice };
