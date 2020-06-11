const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
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
      emailNotificationRecipients: {
        type: DataTypes.TEXT,
      },
    },
    { tableName: "Users" }
  );

  return User;
};
