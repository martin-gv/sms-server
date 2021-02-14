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
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "INACTIVE",
        allowNull: false,
      },
    },
    { tableName: "Users" }
  );

  return User;
};
