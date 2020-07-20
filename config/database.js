const Sequelize = require("sequelize");

const database = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const sequelize = new Sequelize(database, user, password, {
  host: "localhost",
  dialect: "postgres",
});

// Initialize models
const User = require("../models/User")(sequelize);
const Conversation = require("../models/Conversation")(sequelize);

// Set up associations
User.hasMany(Conversation, { foreignKey: "userId" });
Conversation.belongsTo(User, { foreignKey: "userId" });

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = sequelize;
