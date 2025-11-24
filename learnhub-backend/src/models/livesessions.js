const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livesessions', {
    sessionid: {
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
    sessionlink: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    scheduledat: {
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
    tableName: 'livesessions',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "livesessions_pkey",
        unique: true,
        fields: [
          { name: "sessionid" },
        ]
      },
    ]
  });
};
