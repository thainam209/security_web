const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "lessons",
    {
      lessonid: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      courseid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "courses",
          key: "courseid",
        },
      },
      chapterid: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "chapters",
          key: "chapterid",
        },
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      videourl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      sortorder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      createdat: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      tableName: "lessons",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "lessons_pkey",
          unique: true,
          fields: [{ name: "lessonid" }],
        },
      ],
    }
  );
};
