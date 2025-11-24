const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "lessoncomments",
    {
      commentid: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      lessonid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "lessons",
          key: "lessonid",
        },
        onDelete: "CASCADE",
      },
      studentid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "userid",
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdat: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      tableName: "lessoncomments",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "lessoncomments_pkey",
          unique: true,
          fields: [{ name: "commentid" }],
        },
      ],
    }
  );
};
