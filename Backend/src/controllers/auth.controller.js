const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ─────────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const teacher = await prisma.teacher.findUnique({ where: { email } });

    if (!teacher) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, teacher.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: teacher.id, role: teacher.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        classes: teacher.classes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Basic email validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Valid email is required." });
    }

    // Generic response — never reveal whether email exists (prevents enumeration attacks)
    const genericResponse = {
      success: true,
      message: "If an account exists with this email, a reset link has been generated.",
    };

    const teacher = await prisma.teacher.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Return a clear error if no account is found
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    // Generate cryptographically secure raw token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store SHA-256 hash of token in DB (never store raw token)
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Token expires in 1 hour
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiry,
      },
    });

    // Build reset link — user receives raw token in URL
    const frontendUrl = process.env.FRONTEND_URL || "https://parent-summary-frontend.onrender.com";
    const resetLink = `${frontendUrl}/reset-password/${rawToken}`;

    // TODO: Replace with real email service in production
    // Options: Resend (https://resend.com), SendGrid, Nodemailer
    // Example with Nodemailer:
    //   await transporter.sendMail({
    //     to: teacher.email,
    //     subject: "Reset your Intellitots password",
    //     html: `<p>Click to reset (valid 1 hour): <a href="${resetLink}">Reset Password</a></p>`,
    //   });

    // DEMO MODE: Return the reset link directly in the response
    // Remove 'resetLink' and 'note' fields once real email delivery is wired up
    return res.status(200).json({
      ...genericResponse,
      resetLink,
      note: "Demo mode: Copy the resetLink and open it in your browser to reset your password.",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// RESET PASSWORD
// POST /api/auth/reset-password
// ─────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Input validation
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Reset token is required." });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    // Hash the incoming raw token to compare against DB stored hash
    const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

    // Find teacher with this token that hasn't expired yet
    const teacher = await prisma.teacher.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!teacher) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Hash the new password with bcrypt (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear token fields (one-time use enforcement)
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        password: hashedPassword,
        resetToken: null,       // Invalidate token immediately after use
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, forgotPassword, resetPassword };