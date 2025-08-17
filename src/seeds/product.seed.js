const { faker } = require("@faker-js/faker");

const { Product } = require("../modules/products/models/Products.model");
const { sequelize } = require("../modules/configs/db");

async function seedProducts() {
  try {
    await sequelize.sync({ force: true });
    console.log("Database synced!");

    const products = [];

    // 20 data
    for (let i = 0; i < 20; i++) {
      products.push({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        stock: faker.number.int({ min: 0, max: 100 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await Product.bulkCreate(products);
    console.log("Seed data inserted successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await sequelize.close();
  }
}

seedProducts();
