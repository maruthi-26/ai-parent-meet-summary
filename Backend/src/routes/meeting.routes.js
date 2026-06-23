const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const {
  createMeeting,
  getMeetings,
  rateMeeting,
  getMeetingById,
  updateMeetingDetails,
} = require("../controllers/meeting.controller");

const router = express.Router();

router.post("/", authMiddleware, createMeeting);
router.get("/", authMiddleware, getMeetings);
router.get("/:id", authMiddleware, getMeetingById);
router.patch("/:id", authMiddleware, updateMeetingDetails);
router.patch("/:meetingId/rate", authMiddleware, rateMeeting);

module.exports = router;