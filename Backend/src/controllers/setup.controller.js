const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────
// GET SETUP STATUS
// GET /api/setup/status
// ─────────────────────────────────────────────
const getSetupStatus = async (req, res, next) => {
  try {
    const adminCount = await prisma.teacher.count({
      where: { role: "ADMIN" },
    });

    return res.status(200).json({
      success: true,
      setupRequired: adminCount === 0,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// CREATE FIRST ADMIN
// POST /api/setup/create-admin
// ─────────────────────────────────────────────
const createFirstAdmin = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Check if setup is already completed
    const adminCount = await prisma.teacher.count({
      where: { role: "ADMIN" },
    });

    if (adminCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Setup is permanently disabled as an administrator already exists.",
      });
    }

    // Input Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Full Name is required." });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "A valid email is required." });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmation password do not match.",
      });
    }

    // Hash password (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the first admin user
    const admin = await prisma.teacher.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return res.status(201).json({
      success: true,
      message: "First administrator account created successfully. Setup is now disabled.",
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSetupStatus, createFirstAdmin };
