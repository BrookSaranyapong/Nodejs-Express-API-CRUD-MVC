const { fail } = require("../utils/response");
const statusCode = require("../constants/statusCodes");

function permissionGuard(requiredPerms = [], { mode = "any", resolver } = {}) {
  const need = toArray(requiredPerms);
  if (need.length === 0) return (_req, _res, next) => next();

  return async (req, res, next) => {
    if (!req.user) return fail(res, "Unauthorized", statusCode.UNAUTHORIZED);

    try {
      // เอาจาก req.user ก่อน
      let perms = toArray(req.user.permissions);

      // ไม่มี perms → ลองขอจาก resolver (ถ้ามี)
      if (
        perms.length === 0 &&
        typeof resolver === "function" &&
        !req.__permResolved
      ) {
        req.__permResolved = true; // กันเรียกซ้ำใน request เดียว
        const resolved = await resolver(req.user.id);
        perms = toArray(resolved?.permissions);
        req.user.permissions = perms; // เก็บไว้ให้ตัวถัดไปใช้
        if (resolved?.roles) req.user.roles = resolved.roles;
      }

      if (perms.length === 0)
        return fail(res, "Forbidden", statusCode.FORBIDDEN);

      const ok =
        mode === "all"
          ? need.every((p) => perms.includes(p))
          : need.some((p) => perms.includes(p));

      if (!ok) return fail(res, "Forbidden", statusCode.FORBIDDEN);
      return next();
    } catch {
      return fail(
        res,
        "Unable to resolve permissions",
        statusCode.INTERNAL_ERROR
      );
    }
  };
}

/* helpers */
function toArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v.filter(Boolean) : [v].filter(Boolean);
}

module.exports = { permissionGuard };
