const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reports', {
    reportid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    studentid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userid'
      }
    },
    courseid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'courseid'
      }
    },
    completedlessons: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    completedassignments: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    totalscore: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    lastupdated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'reports',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "reports_pkey",
        unique: true,
        fields: [
          { name: "reportid" },
        ]
      },
    ]
  });
};
