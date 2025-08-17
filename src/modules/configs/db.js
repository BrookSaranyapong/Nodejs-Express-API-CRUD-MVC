// sequelize configuration for the database connection for sqlite

const { Sequelize } = require("sequelize");
const path = require("path");
const { initProductModel } = require("../products/models/Products.model");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "db/database.sqlite"),
  logging: false,
});

const Product = initProductModel(sequelize);

async function connectDatabase() {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log("DB connected & synced");
}
module.exports = {
  sequelize,
  connectDatabase,
  Product,
};
