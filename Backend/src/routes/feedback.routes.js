const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const {
  submitFeedback,
  getFeedbacks,
  getFeedbackByMeetingId,
} = require("../controllers/feedback.controller");

const router = express.Router();

router.post("/", submitFeedback);
router.get("/", authMiddleware, getFeedbacks);
router.get("/:meetingId", getFeedbackByMeetingId);

module.exports = router;
