const { Model, DataTypes } = require("sequelize");

class _User extends Model {}

function initUserModel(sequelize) {
  _User.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING },
      // (option) role baseline ถ้ายังไม่ทำตาราง roles แยก
      role: { type: DataTypes.STRING, allowNull: false, defaultValue: "user" }, // 'admin' | 'user' ...
    },
    { sequelize, modelName: "User", tableName: "users", timestamps: true }
  );

  return _User;
}

module.exports = { _User, initUserModel };
