const { fail } = require("../utils/response");
const StatusCodes = require("../constants/statusCodes");

// ใช้กับ body / params / query ได้
const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const data = req[source];
    const result = schema.safeParse(data);
    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(", ");
      return fail(res, message, StatusCodes.BAD_REQUEST);
    }
    // ใส่ค่าที่ parse แล้วกลับไป (เช่น coerce number)
    req[source] = result.data;
    next();
  };

module.exports = { validate };
