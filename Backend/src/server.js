require("dotenv").config();

console.log("JWT_SECRET =", process.env.JWT_SECRET);
console.log(
  "GEMINI API:",
  process.env.GEMINI_API_KEY
    ? "Loaded"
    : "Missing"
);

const app = require("./app");
const teacherRoutes =
  require("./routes/teacher.routes");

app.use("/teachers", teacherRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
