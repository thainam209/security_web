const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "submissions",
    {
      submissionid: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      assignmentid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "assignments",
          key: "assignmentid",
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
      fileurl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      submittedat: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      grade: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "submissions",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "submissions_pkey",
          unique: true,
          fields: [{ name: "submissionid" }],
        },
      ],
    }
  );
};
