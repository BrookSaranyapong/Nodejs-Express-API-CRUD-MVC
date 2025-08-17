const { ProductRepository } = require("../repositories/products.repository");

class ProductsService {
  constructor() {
    this.repo = new ProductRepository();
  }
  async createProduct(data) {
    return this.repo.createProduct(data);
  }
  async getProductById(id) {
    return this.repo.getProductById(id);
  }
  async updateProduct(id, data) {
    const affected = await this.repo.updateProduct(id,data);
    if (!affected) return null;
    return await this.repo.findById(id);
  }
  async deleteProduct(id) {
    return this.repo.deleteProduct(id);
  }
  async getAllProducts() {
    return this.repo.getAllProducts();
  }
}

module.exports = new ProductsService();
