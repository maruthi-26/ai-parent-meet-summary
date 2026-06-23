const express = require("express");
const router = express.Router();
const {
  getNotices,
  getNotice,
  createNotice,
  deleteNotice,
} = require("../controllers/notice.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, getNotices);
router.get("/:id", authMiddleware, getNotice);
router.post("/", authMiddleware, createNotice);
router.delete("/:id", authMiddleware, deleteNotice);

module.exports = router;
