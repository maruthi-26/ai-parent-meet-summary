const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const {
  sendWhatsApp,
} = require("../controllers/whatsapp.controller");

const router = express.Router();

router.post(
  "/send/:meetingId",
  authMiddleware,
  sendWhatsApp
);

module.exports = router;