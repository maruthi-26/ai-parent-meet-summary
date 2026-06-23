const prisma = require("./src/prisma/prisma");
const bcrypt = require("bcryptjs");

async function main() {
  const password =
    await bcrypt.hash("admin123", 10);

  await prisma.teacher.create({
    data: {
      name: "Admin",
      email: "admin@test.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("Admin Created");
}

main();