// src/modules/products/models/Products.model.js
// schema model sequelize for products

const { Model, DataTypes } = require('sequelize');

class _Product extends Model {}

function initProductModel(sequelize){ 
    _Product.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        timestamps: true
    });

    return _Product;
}

module.exports = { _Product, initProductModel };