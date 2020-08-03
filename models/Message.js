const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Message = sequelize.define("Message", {
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {tableName: "Conversations"},
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    isInboundMessage: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    messageContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  return Message;
};
