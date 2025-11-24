const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('promotions', {
    promotionid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "promotions_code_key"
    },
    discountpercentage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    startdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    enddate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'promotions',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "promotions_code_key",
        unique: true,
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "promotions_pkey",
        unique: true,
        fields: [
          { name: "promotionid" },
        ]
      },
    ]
  });
};
