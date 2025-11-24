const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "quizoptions",
    {
      optionid: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      questionid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "quizquestions",
          key: "questionid",
        },
        onDelete: "CASCADE",
      },
      optiontext: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "quizoptions",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "quizoptions_pkey",
          unique: true,
          fields: [{ name: "optionid" }],
        },
      ],
    }
  );
};
