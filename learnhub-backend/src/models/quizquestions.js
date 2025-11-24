const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "quizquestions",
    {
      questionid: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      quizid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "quizzes",
          key: "quizid",
        },
        onDelete: "CASCADE",
      },
      questiontext: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      correctoptionid: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "quizquestions",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "quizquestions_pkey",
          unique: true,
          fields: [{ name: "questionid" }],
        },
      ],
    }
  );
};
