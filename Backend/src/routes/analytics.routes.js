const express = require("express");
const router = express.Router();
const {
  getTeacherAnalytics,
  getAdminAnalytics,
  getActivityFeed,
  getReminders,
} = require("../controllers/analytics.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/admin", authMiddleware, getAdminAnalytics);
router.get("/activity-feed", authMiddleware, getActivityFeed);
router.get("/reminders", authMiddleware, getReminders);
router.get("/teacher/:teacherId", authMiddleware, getTeacherAnalytics);

module.exports = router;

