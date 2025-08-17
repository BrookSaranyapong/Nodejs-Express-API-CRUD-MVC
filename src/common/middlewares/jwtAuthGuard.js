const statusCode = require("../constants/statusCodes");
const { fail } = require("../utils/response");
const { extractAccessToken, verifyAccessToken } = require("../utils/jwt");

const {
  getRedis,
  isJtiRevoked,
  ensureSessionAlive,
} = require("../utils/redis");

function jwtAuthGuard(
  models,
  { optional = false, clockToleranceSec = 5 } = {}
) {
  // ดึง instance เดียวใช้ซ้ำใน middleware
  const redis = getRedis();
  const SessionModel = models._Session;

  return async (req, res, next) => {
    const token = extractAccessToken(req);
    if (!token) {
      if (optional) {
        req.user = null;
        return next();
      }
      return fail(res, "No token", statusCode.UNAUTHORIZED);
    }

    let payload;
    try {
      payload = verifyAccessToken(token, process.env.ACCESS_SECRET, {
        clockToleranceSec,
      });
    } catch (e) {
      return fail(res, e.code || "Invalid token", statusCode.UNAUTHORIZED);
    }

    const { jti, sid, sub, exp, iat } = payload || {};
    if (!jti || !sid || !sub)
      return fail(res, "Invalid token", statusCode.UNAUTHORIZED);

    if (await isJtiRevoked(redis, jti)) {
      return fail(res, "Token revoked", statusCode.UNAUTHORIZED);
    }

    if (!(await ensureSessionAlive(redis, SessionModel, sid))) {
      return fail(res, "Session invalid", statusCode.UNAUTHORIZED);
    }

    req.user = { id: sub, sessionId: sid, jti, exp, iat };
    next();
  };
}

module.exports = { jwtAuthGuard };
