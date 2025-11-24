const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "quizzes",
    {
      quizid: {
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
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      createdat: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      timelimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      showanswersaftersubmission: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      maxattempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      tableName: "quizzes",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "quizzes_pkey",
          unique: true,
          fields: [{ name: "quizid" }],
        },
      ],
    }
  );
};
