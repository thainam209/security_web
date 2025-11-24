const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userdetails', {
    userdetailsid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userid'
      }
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    certificate: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    approvalstatus: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "Pending"
    },
    dateofbirth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ""
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ""
    }
  }, {
    sequelize,
    tableName: 'userdetails',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "userdetails_pkey",
        unique: true,
        fields: [
          { name: "userdetailsid" },
        ]
      },
    ]
  });
};
