// src/modules/auth/index.js
const { Router } = require("express");
const AuthController = require("./controllers/auth.controller");
const { validate } = require("../../common/middlewares/validate");
const { jwtAuthGuard } = require("../../common/middlewares/jwtAuthGuard");

// DTO
const {
  registerSchema,
  loginSchema,
  refreshSchema,
} = require("./dto/auth.dto");
const { models } = require("../../configs/db");

// ถ้าคุณใช้ db/sequelize รวม models ไว้

const router = Router();
const controller = new AuthController();

// routes แบบเปิด
router.post("/register", validate(registerSchema, "body"), controller.register);
router.post("/login", validate(loginSchema, "body"), controller.login);
router.post("/refresh", validate(refreshSchema, "body"), controller.refresh);

// routes ที่ต้องมี access token
router.post("/revoke", jwtAuthGuard(models), controller.revoke);
router.post("/logout", jwtAuthGuard(models), controller.logout);
router.post("/logout-all", jwtAuthGuard(models), controller.logoutAll);
router.get("/me", jwtAuthGuard(models), controller.me);

// (ถ้าต้อง optional auth)
// router.get("/some", jwtAuthGuard(models, { optional: true }), controller.some);

module.exports = router;
