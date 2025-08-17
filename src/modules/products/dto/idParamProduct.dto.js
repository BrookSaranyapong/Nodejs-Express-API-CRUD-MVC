const { z } = require("zod");

const idParamProductDto = z
  .object({
    id: z
      .string()
      .regex(/^\d+$/, "id must be a numeric string")
      .transform(Number),
  })
  .strict();

module.exports = { idParamProductDto };
