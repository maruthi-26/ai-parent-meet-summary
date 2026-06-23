const express = require("express");
const { login, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const { loginLimiter, forgotPasswordLimiter } = require("../middleware/rateLimit.middleware");

const router = express.Router();

router.post("/login", loginLimiter, login);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;