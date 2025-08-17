const authService = require("../services/auth.service"); // << instance ที่ export จาก service
const { success } = require("../../../common/utils/response");
const StatusCodes = require("../../../common/constants/statusCodes");
const jwt = require("jsonwebtoken");

class AuthController {
  register = async (req, res, next) => {
    try {
      const user = await authService.register(req.body);
      return success(res, user, StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const userAgent = req.get("User-Agent");
      const ip = req.ip;
      const data = await authService.login({ ...req.body, userAgent, ip });
      return success(res, data, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const userAgent = req.get("User-Agent");
      const ip = req.ip;
      const data = await authService.refresh({
        refreshToken: req.body.refreshToken,
        userAgent,
        ip,
      });
      return success(res, data, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  };

  revoke = async (req, res, next) => {
    try {
      // ต้องผ่าน jwtAuthGuard มาก่อน เพื่อมี req.user.jti
      const auth = req.header("Authorization") || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      const decoded = token ? jwt.decode(token) : null; // ใช้ exp สำหรับ TTL revoke
      const data = await authService.revokeAccess({
        jti: req.user.jti,
        exp: decoded?.exp,
      });
      return success(res, data, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req, res, next) => {
    try {
      const data = await authService.logout({ sessionId: req.user.sessionId });
      return success(res, data, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  };

  logoutAll = async (req, res, next) => {
    try {
      const data = await authService.logoutAll({ userId: req.user.id });
      return success(res, data, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  };

  me = async (req, res, next) => {
    try {
      // จะให้ดึง profile เต็มจาก DB ก็เรียก service ได้ เช่น:
      // const profile = await authService.getProfile(req.user.id)
      return success(res, { id: req.user.id }, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = AuthController;
