const { Model, DataTypes } = require("sequelize");

class _Session extends Model {}

function initSessionModel(sequelize) {
  _Session.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      refresh_token_hash: { type: DataTypes.STRING, allowNull: false },
      user_agent: { type: DataTypes.STRING },
      ip: { type: DataTypes.STRING },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      last_used_at: { type: DataTypes.DATE },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      revoked_at: { type: DataTypes.DATE },
      revoked_reason: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "Session",
      tableName: "sessions",
      timestamps: false,
    }
  );

  return _Session;
}

module.exports = { _Session, initSessionModel };
