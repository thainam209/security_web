const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('schedules', {
    scheduleid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    courseid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'courseid'
      }
    },
    teacherid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userid'
      }
    },
    classdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    topic: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'schedules',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "schedules_pkey",
        unique: true,
        fields: [
          { name: "scheduleid" },
        ]
      },
    ]
  });
};
