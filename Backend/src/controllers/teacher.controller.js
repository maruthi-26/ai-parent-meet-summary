const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const getTeachers = async (req, res) => {
  try {
    const { role } = req.query;
    const where = {};
    if (role) {
      where.role = role;
    } else if (req.user.role !== "ADMIN") {
      where.role = "TEACHER";
    }

    const teachers = await prisma.teacher.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(teachers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      classes,
      role,
      gender,
    } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden: Only admins can manage users" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "ADMIN" ? "ADMIN" : "TEACHER",
        classes: role === "ADMIN" ? null : classes,
        gender,
      },
    });

    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, classes, role, gender } = req.body;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden: Only admins can manage users" });
    }

    const updateData = {
      name,
      email,
      role: role === "ADMIN" ? "ADMIN" : "TEACHER",
      classes: role === "ADMIN" ? null : classes,
      gender,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: updateData,
    });

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden: Only admins can manage users" });
    }

    // Nullify teacherId relation on associated students
    await prisma.student.updateMany({
      where: { teacherId: id },
      data: { teacherId: null },
    });

    // Delete associated notices and meetings
    await prisma.notice.deleteMany({ where: { createdById: id } });

    // Fetch meetings to delete their feedback
    const meetings = await prisma.meeting.findMany({ where: { teacherId: id } });
    const meetingIds = meetings.map((m) => m.id);
    if (meetingIds.length > 0) {
      await prisma.feedback.deleteMany({
        where: { meetingId: { in: meetingIds } },
      });
    }

    await prisma.meeting.deleteMany({ where: { teacherId: id } });

    await prisma.teacher.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};