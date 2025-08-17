// src/modules/products/dto/product.dto.js
const { z } = require("zod");

// params: /products/:id
const idParamSchema = z.object({
  id: z.coerce.number().int().positive("id must be a positive integer"),
});

// body: POST /products
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
});

// body: PUT /products/:id  (อนุญาต partial หรือ full ตามต้องการ)
// ถ้าอยาก partial ใช้ .partial()
const updateProductSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    price: z.coerce.number().nonnegative().optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "No fields provided",
  });

module.exports = {
  idParamSchema,
  createProductSchema,
  updateProductSchema,
};