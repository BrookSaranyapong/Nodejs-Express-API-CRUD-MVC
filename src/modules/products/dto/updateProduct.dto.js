const { productBase } = require("./base/productBase.schema");

const updateProductDto = productBase
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

module.exports = { updateProductDto };
