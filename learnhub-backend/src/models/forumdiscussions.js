const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('forumdiscussions', {
    discussionid: {
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    createdby: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userid'
      }
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'forumdiscussions',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "forumdiscussions_pkey",
        unique: true,
        fields: [
          { name: "discussionid" },
        ]
      },
    ]
  });
};
