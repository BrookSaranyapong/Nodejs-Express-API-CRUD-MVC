const jwt = require("jsonwebtoken");
const { redis } = require("../../redis/redis");
const { fail } = require("../utils/response");
const statusCode = require("../constants/statusCodes");

const getToken = (req) => {
  const a = req.header("Authorization");
  if (a && a.startsWith("Bearer ")) return a.slice(7).trim();
  const x = req.header("X-Access-Token");
  return x ? String(x).trim() : null;
};

function jwtAuthGuard(models, { optional = false } = {}) {
  return async (req, res, next) => {
    const token = getToken(req);
    if (!token) {
      if (optional) {
        req.user = null;
        return next();
      }
      return fail(res, "No token", statusCode.UNAUTHORIZED);
    }

    let verifyToken;
    try {
      verifyToken = jwt.verify(token, process.env.ACCESS_SECRET);
    } catch (e) {
      return fail(
        res,
        e.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
        statusCode.UNAUTHORIZED
      );
    }

    const { jti, sid, sub, exp, iat } = verifyToken;

    if (await redis.get(`revoked:jti:${jti}`)) {
      return fail(res, "Token revoked", statusCode.UNAUTHORIZED);
    }

    let alive = await redis.get(`session:${sid}`);
    if (!alive) {
      const s = await models.Session.findByPk(sid);
      const now = Date.now();
      if (!s || s.revoked_at || new Date(s.expires_at).getTime() <= now) {
        return fail(res, "Session invalid", statusCode.UNAUTHORIZED);
      }
      const ttl = Math.floor((new Date(s.expires_at).getTime() - now) / 1000);
      if (ttl > 0) await redis.set(`session:${sid}`, "active", "EX", ttl);
    }

    req.user = { id: sub, sessionId: sid, jti, exp, iat }; // สามารถเติม roles/permissions ภายหลังได้
    next();
  };
}

module.exports = { jwtAuthGuard };
