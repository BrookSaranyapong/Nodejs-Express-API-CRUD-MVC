const { z } = require("zod");

const listQueryProductDto = z
  .object({
    page: z
      .string()
      .regex(/^\d+$/, "page must be numeric")
      .transform(Number)
      .default("1")
      .transform((n) => (n < 1 ? 1 : n)),
    pageSize: z
      .string()
      .regex(/^\d+$/, "pageSize must be numeric")
      .transform(Number)
      .default("20")
      .transform((n) => Math.min(Math.max(n, 1), 100)),
    search: z.string().trim().optional(),
  })
  .partial();

module.exports = { listQueryProductDto };
