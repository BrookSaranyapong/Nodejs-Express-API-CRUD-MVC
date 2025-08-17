const { faker } = require("@faker-js/faker");
const argon2 = require("argon2");

let _User;
try {
  ({ _User } = require("../modules/auth/models/Users.model"));
} catch (e1) {
  try {
    ({ User: _User } = require("../modules/auth/models/user.model"));
  } catch (e2) {
    console.error(
      "❌ หา User model ไม่เจอ: ปรับ path ในไฟล์ seed ให้ตรงกับโปรเจกต์คุณ"
    );
    process.exit(1);
  }
}

const { sequelize } = require("../modules/configs/db");

async function seedUsers() {
  try {
    await sequelize.sync({ force: true }); // ⚠️ ล้างทั้ง DB
    console.log("Database synced!");

    const DEFAULT_PASSWORD = "User@123"; // รหัสผ่านเดียวกันทุกคน (สะดวกทดสอบ)
    const password_hash = await argon2.hash(DEFAULT_PASSWORD, {
      type: argon2.argon2id,
    });

    const roles = ["admin", "manager", "user"];
    const users = [];

    // 20 records
    for (let i = 0; i < 20; i++) {
      const fullName = faker.person.fullName();
      const email = faker.internet.email({
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ")[1] || "",
        provider: "example.com",
      });

      users.push({
        email,
        password_hash,
        name: fullName,
        role: roles[Math.floor(Math.random() * roles.length)], // ถ้าไม่ได้ใช้ role ลบออกได้
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await _User.bulkCreate(users);
    console.log("✅ Seed users inserted successfully!");
    console.log(
      "ℹ️  Default login password for all seeded users:",
      DEFAULT_PASSWORD
    );
    console.log(
      "🔎  Sample emails:",
      users.slice(0, 3).map((u) => u.email)
    );
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  } finally {
    await sequelize.close();
  }
}

seedUsers();
