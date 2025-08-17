const productsService = require("../services/products.service");

class ProductsController {
  ping = (req, res) => {
    res.send("Products endpoint is working!");
  };

  getAllProducts = async (req, res) => {
    try {
      const products = await productsService.getAllProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  getProductById = async (req, res) => {
    try {
      const product = await productsService.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: "Not found" });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  createProduct = async (req, res) => {
    try {
      const product = await productsService.createProduct(req.body);
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  updateProduct = async (req, res) => {
    try {
      const updated = await productsService.updateProduct(
        req.params.id,
        req.body
      );
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  deleteProduct = async (req, res) => {
    try {
      const deleted = await productsService.deleteProduct(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Not found" });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = ProductsController;
