const productsService = require("../services/products.service");
const { success, fail } = require("../../../common/utils/response");
const StatusCodes = require("../../../common/constants/statusCodes");

class ProductsController {
  ping = (req, res) => {
    return success(
      res,
      { message: "Products endpoint is working!" },
      StatusCodes.OK
    );
  };

  getAllProducts = async (req, res, next) => {
    try {
      const products = await productsService.getAllProducts();
      return success(res, products, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  };

  getProductById = async (req, res, next) => {
    try {
      const product = await productsService.getProductById(req.params.id); // id ถูก coerce แล้ว
      if (!product) return fail(res, "Not found", StatusCodes.NOT_FOUND);
      return success(res, product, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  };

  createProduct = async (req, res, next) => {
    try {
      const product = await productsService.createProduct(req.body);
      return success(res, product, StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  };

  updateProduct = async (req, res, next) => {
    try {
      const updated = await productsService.updateProduct(
        req.params.id,
        req.body
      );
      if (!updated) return fail(res, "Not found", StatusCodes.NOT_FOUND);
      return success(res, updated, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  };

  deleteProduct = async (req, res, next) => {
    try {
      const deleted = await productsService.deleteProduct(req.params.id);
      if (!deleted) return fail(res, "Not found", StatusCodes.NOT_FOUND);
      return success(res, null, StatusCodes.NO_CONTENT);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = ProductsController;
