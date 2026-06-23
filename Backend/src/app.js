require("dotenv").config();
const express = require("express");
const prisma = require("./config/prisma");
const teacherRoutes = require("./routes/teacher.routes");
const studentRoutes = require("./routes/student.routes");
const authRoutes = require("./routes/auth.routes");
const setupRoutes = require("./routes/setup.routes");
const meetingRoutes = require("./routes/meeting.routes");
const aiRoutes = require("./routes/ai.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const whatsappRoutes = require("./routes/whatsapp.routes");
const emailRoutes = require("./routes/email.routes");
const noticeRoutes = require("./routes/notice.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const auditRoutes = require("./routes/audit.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://parent-summary-frontend.onrender.com",
  "https://ai-parent-meet-summary.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.endsWith(".onrender.com") ||
        (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL);

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin: ${origin}`);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/health", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use(errorHandler);

module.exports = app;