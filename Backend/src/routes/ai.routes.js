const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const {
  generateMeetingSummary,
  generateNotice,
} = require("../controllers/ai.controller");

const router = express.Router();

router.post("/generate/:meetingId", authMiddleware, generateMeetingSummary);
router.post("/generate-notice", authMiddleware, generateNotice);

module.exports = router;