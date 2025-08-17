// sequelize configuration for the database connection for sqlite

const { Sequelize } = require("sequelize");
const path = require("path");
const { initProductModel } = require("../modules/products/models/Products.model");
const { initAccessTokenBlacklistModel } = require("../modules/auth/models/accessTokenBlacklist.model");
const { initSessionModel } = require("../modules/auth/models/session.model");
const { initUserModel } = require("../modules/auth/models/user.model");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "db/database.sqlite"),
  logging: false,
});

// Modules
const models = {};
models._Product = initProductModel(sequelize);
models._AccessTokenBlacklist = initAccessTokenBlacklistModel(sequelize);
models._Session = initSessionModel(sequelize);
models._User = initUserModel(sequelize);


async function syncDB() {
  await sequelize.authenticate();
  await sequelize.sync(); // ในโปรดักชันใช้ migration แทน
}

module.exports = { sequelize, models, syncDB };