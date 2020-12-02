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
      smsNumber: {
        type: DataTypes.TEXT,
      },
      accountKey: {
        type: DataTypes.UUID,
      },
    },
    { tableName: "Users" }
  );

  return User;
};
