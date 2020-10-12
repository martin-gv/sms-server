const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: "Users" },
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      contactPhoneNumber: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      contactFirstName: DataTypes.TEXT,
      contactLastName: DataTypes.TEXT,
      unreadMessages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    { tableName: "Conversations" }
  );

  return Conversation;
};
