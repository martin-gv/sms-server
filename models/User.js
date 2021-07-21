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
      stripeCustomerId: {
        type: DataTypes.TEXT,
        unique: true,
      },
      subscriptionStatus: {
        type: DataTypes.ENUM("INCOMPLETE", "ACTIVE", "PAST DUE", "CANCELED"),
        defaultValue: "INCOMPLETE",
        allowNull: false,
      },
      hasPaymentError: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
    },
    { tableName: "Users" }
  );

  return User;
};
