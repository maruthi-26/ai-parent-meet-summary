const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { sendEmail } = require("../controllers/email.controller");

const router = express.Router();

router.post("/send/:meetingId", authMiddleware, sendEmail);

module.exports = router;
