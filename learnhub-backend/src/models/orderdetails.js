const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "orderdetails",
    {
      orderdetailid: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      orderid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
          key: "orderid",
        },
      },
      courseid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "courses",
          key: "courseid",
        },
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "orderdetails",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "orderdetails_pkey",
          unique: true,
          fields: [{ name: "orderdetailid" }],
        },
      ],
    }
  );
};
