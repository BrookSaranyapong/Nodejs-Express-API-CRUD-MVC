const { _Product } = require("../models/Products.model"); // Assuming you have a Product model defined

class ProductRepository {
  async createProduct(data) {
    return await _Product.create(data);
  }

  async getProductById(id) {
    return await _Product.findByPk(id);
  }
  async updateProduct(id, data) {
    const [affected] = await _Product.update(data, { where: { id } });
    return affected;
  }

  async deleteProduct(id) {
    return await _Product.destroy({ where: { id } });
  }

  async getAllProducts() {
    return await _Product.findAll({ order: [["id", "ASC"]] });
  }
}

module.exports = { ProductRepository };
