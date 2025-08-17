const { fail } = require("../utils/response");
const statusCode = require("../constants/statusCodes");

/**
 * permissionGuard(requiredPerms: string[], options?: {
 *   mode?: 'any' | 'all',                  // any = มีสักอันก็ผ่าน, all = ต้องครบ
 *   resolver?: (userId) => Promise<{permissions?: string[], roles?: string[]}>
 * })
 */
function permissionGuard(requiredPerms = [], { mode = "any", resolver } = {}) {
  return async (req, res, next) => {
    if (!req.user) return fail(res, "Unauthorized", statusCode.UNAUTHORIZED);

    let perms = req.user.permissions;
    if ((!perms || !perms.length) && typeof resolver === "function") {
      try {
        const auth = await resolver(req.user.id);
        perms = auth?.permissions || [];
        req.user.permissions = perms;
        if (auth?.roles) req.user.roles = auth.roles; // เผื่อใช้กับ roleGuard
      } catch {
        return fail(res, "Unable to resolve permissions", statusCode.INTERNAL_ERROR);
      }
    }

    if (!perms || perms.length === 0)
      return fail(res, "Forbidden", statusCode.FORBIDDEN);

    const hasAny = requiredPerms.some((p) => perms.includes(p));
    const hasAll = requiredPerms.every((p) => perms.includes(p));
    const ok = mode === "all" ? hasAll : hasAny;

    if (!ok) return fail(res, "Forbidden", statusCode.FORBIDDEN);
    next();
  };
}

module.exports = { permissionGuard };
