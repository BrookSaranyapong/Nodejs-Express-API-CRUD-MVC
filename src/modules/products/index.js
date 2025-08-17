const express = require("express");
const router = express.Router();
const ProductsController = require("./controllers/products.controller");
const { validate } = require("../common/middlewares/validate");
const {
  createProductDto,
  updateProductDto,
  idParamProductDto,
  listQueryProductDto,
} = require("./dto");

const controller = new ProductsController();

router.get("/products/ping", controller.ping);

router.get(
  "/products",
  validate(listQueryProductDto, "query"),
  controller.getAllProducts
);

router.get(
  "/products/:id",
  validate(idParamProductDto, "params"),
  controller.getProductById
);

router.post(
  "/products",
  validate(createProductDto, "body"),
  controller.createProduct
);

router.put(
  "/products/:id",
  validate(idParamProductDto, "params"),
  validate(updateProductDto, "body"),
  controller.updateProduct
);

router.delete(
  "/products/:id",
  validate(idParamProductDto, "params"),
  controller.deleteProduct
);

module.exports = router;
