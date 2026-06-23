const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  getStudentProfile,
} = require("../controllers/student.controller");

const router = express.Router();

router.post("/", authMiddleware, createStudent);
router.get("/", authMiddleware, getStudents);
router.get("/:id/profile", authMiddleware, getStudentProfile);
router.patch("/:id", authMiddleware, updateStudent);
router.delete("/:id", authMiddleware, deleteStudent);

module.exports = router;