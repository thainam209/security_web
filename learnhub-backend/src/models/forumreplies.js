const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('forumreplies', {
    replyid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    discussionid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'forumdiscussions',
        key: 'discussionid'
      }
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userid'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'forumreplies',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "forumreplies_pkey",
        unique: true,
        fields: [
          { name: "replyid" },
        ]
      },
    ]
  });
};
