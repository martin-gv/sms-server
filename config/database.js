const Sequelize = require("sequelize");

// Credentials are hard-coded for the Docker database container
const database = "sms-app-db";
const user = "postgres";
const password = "postgres";
const host = "db";
const port = 5432;

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
