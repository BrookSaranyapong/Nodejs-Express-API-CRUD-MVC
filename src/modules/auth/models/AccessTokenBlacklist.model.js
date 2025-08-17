// src/modules/auth/models/accessTokenBlacklist.model.js
const { Model, DataTypes } = require("sequelize");

class _AccessTokenBlacklist extends Model {}

function initAccessTokenBlacklistModel(sequelize) {
  _AccessTokenBlacklist.init(
    {
      jti: { type: DataTypes.UUID, primaryKey: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      expires_at: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      modelName: "AccessTokenBlacklist",
      tableName: "access_token_blacklist",
      timestamps: false,
    }
  );

  return _AccessTokenBlacklist;
}

module.exports = { _AccessTokenBlacklist, initAccessTokenBlacklistModel };
