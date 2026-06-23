const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const teacher = await prisma.teacher.findUnique({
      where: {
        email,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      teacher.password
    );

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

console.log(process.env.JWT_SECRET);

    const token = jwt.sign(
      {
        id: teacher.id,
        role: teacher.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
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

module.exports = {
  login,
};