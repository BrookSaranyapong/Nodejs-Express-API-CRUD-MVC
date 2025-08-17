const { fail } = require("../utils/response");
const statusCode = require("../constants/statusCodes");

/**
 * roleGuard(requiredRoles: string[], options?: { resolver?: (userId) => Promise<{roles?: string[], permissions?: string[]}> })
 * - ถ้ามี req.user.roles แล้วจะใช้เลย
 * - ถ้าไม่มีและส่ง resolver มา จะเรียก resolver เพื่อนำ roles มาแปะที่ req.user
 */
function roleGuard(requiredRoles = [], { resolver } = {}) {
  return async (req, res, next) => {
    if (!req.user) return fail(res, "Unauthorized", statusCode.UNAUTHORIZED);

    let roles = req.user.roles;
    if ((!roles || !roles.length) && typeof resolver === "function") {
      try {
        const auth = await resolver(req.user.id);
        roles = auth?.roles || [];
        req.user.roles = roles;
        if (auth?.permissions) req.user.permissions = auth.permissions; // เผื่อใช้ต่อกับ permissionGuard
      } catch {
        return fail(
          res,
          "Unable to resolve roles",
          statusCode.INTERNAL_SERVER_ERROR
        );
      }
    }

    if (!roles || roles.length === 0)
      return fail(res, "Forbidden", statusCode.FORBIDDEN);
    const ok = roles.some((r) => requiredRoles.includes(r));
    if (!ok) return fail(res, "Forbidden", statusCode.FORBIDDEN);

    next();
  };
}

module.exports = { roleGuard };
