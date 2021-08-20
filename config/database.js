const Sequelize = require("sequelize");

const password = process.env.POSTGRES_PASSWORD; // required

const database = process.env.POSTGRES_DB || "postgres";
const user = process.env.POSTGRES_USER || "postgres";
const host = process.env.POSTGRES_HOST || "db";
const port = process.env.POSTGRES_PORT || 5432;

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
