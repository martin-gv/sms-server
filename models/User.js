const { DataTypes } = require("sequelize");
const db = require("../config/database");

const User = db.define(
  "User",
  {
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { tableName: "Users" }
);

module.exports = User;
