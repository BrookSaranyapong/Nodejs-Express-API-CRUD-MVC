// src/modules/products/index.js
const { Router } = require("express");
const ProductsController = require("./controllers/products.controller");
const { validate } = require("../../common/middlewares/validate");
const { jwtAuthGuard } = require("../../common/middlewares/jwtAuthGuard");
const { permissionGuard } = require("../../common/middlewares/permissionGuard");

const {
  idParamSchema,
  createProductSchema,
  updateProductSchema,
} = require("./dto/product.dto");
const { models } = require("../../configs/db");

const router = Router();
const controller = new ProductsController();

// อ่านอย่างเดียว = public
router.get("/ping", controller.ping);
router.get("/", controller.getAllProducts);
router.get(
  "/:id",
  validate(idParamSchema, "params"),
  controller.getProductById
);

// เขียน/แก้/ลบ = ต้อง auth + มี permission
router.post(
  "/",
  jwtAuthGuard(models),
  permissionGuard(["product.create"]), // ต้องมีสิทธิ์ product.create
  validate(createProductSchema, "body"),
  controller.createProduct
);

router.put(
  "/:id",
  jwtAuthGuard(models),
  permissionGuard(["product.update"]), // ต้องมีสิทธิ์ product.update
  validate(idParamSchema, "params"),
  validate(updateProductSchema, "body"),
  controller.updateProduct
);

router.delete(
  "/:id",
  jwtAuthGuard(models),
  permissionGuard(["product.delete"]), // ต้องมีสิทธิ์ product.delete
  validate(idParamSchema, "params"),
  controller.deleteProduct
);

module.exports = router;
