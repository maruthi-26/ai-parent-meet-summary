const express = require("express");
const { getSetupStatus, createFirstAdmin } = require("../controllers/setup.controller");

const router = express.Router();

router.get("/status", getSetupStatus);
router.post("/create-admin", createFirstAdmin);

module.exports = router;
