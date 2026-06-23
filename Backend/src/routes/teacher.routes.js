const express = require("express");

const authMiddleware =
  require("../middleware/auth.middleware");

const {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require(
  "../controllers/teacher.controller"
);

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getTeachers
);

router.post(
  "/",
  authMiddleware,
  createTeacher
);

router.patch(
  "/:id",
  authMiddleware,
  updateTeacher
);

router.delete(
  "/:id",
  authMiddleware,
  deleteTeacher
);

module.exports = router;