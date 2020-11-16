const Sequelize = require("sequelize");

const database = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST || "localhost";
const port = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(database, user, password, {
  host: host,
  port: port,
  dialect: "postgres",
});

// Initialize models
const User = require("../models/User")(sequelize);
const Conversation = require("../models/Conversation")(sequelize);
const Message = require("../models/Message")(sequelize);

// Set up associations
User.hasMany(Conversation, { foreignKey: "userId" });
Conversation.belongsTo(User, { foreignKey: "userId" });

Conversation.hasMany(Message, { foreignKey: "conversationId" });
Message.belongsTo(Conversation, { foreignKey: "conversationId" });

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = sequelize;
