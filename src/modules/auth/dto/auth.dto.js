const { z } = require("zod");

// สมัครสมาชิก
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "password must be at least 6 chars"),
  name: z.string().min(1, "name is required").optional(),
});

// ล็อกอิน
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "password is required"),
});

// รีเฟรชโทเค็น
const refreshSchema = z.object({
  refreshToken: z.string().min(10, "invalid refresh token"),
});

// (ตัวอย่างเพิ่มเติม ถ้าอนาคตอยากทำ change password / forgot password)
/*
const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
*/

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  // changePasswordSchema,
};
