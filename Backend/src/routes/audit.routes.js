const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { getAuditLogs } = require("../controllers/audit.controller");

const router = express.Router();

router.get("/", authMiddleware, getAuditLogs);

module.exports = router;
