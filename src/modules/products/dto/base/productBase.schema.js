const { z } = require("zod");

const numberFromString = (msg = 'must be a number') =>
    z.string().trim().regex(/^\d+(\.\d+)?$/, msg).transform(Number);

const intFromString = (msg = 'must be an integer') =>
    z.string().trim().regex(/^\d+$/, msg).transform((v) => parseInt(v, 10));

const productBase = z.object({
    name : z.string().min(1, "name is required").max(255),
    description: z.string().max(10_000).optional().or(z.literal("")),
    price: z.union([
        z.number().nonnegative('price must be >= 0'),
        numberFromString('price must be a number'),
    ]),
    stock: z.union([
        z.number().int().nonnegative('stock must be >= 0'),
        intFromString('stock must be an integer'),
    ]).optional().default(0),
}).strict();

module.exports = { productBase, numberFromString, intFromString };