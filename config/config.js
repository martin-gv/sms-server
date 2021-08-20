// Load .env file in development
if (
  process.env.NODE_ENV === undefined ||
  process.env.NODE_ENV === "development"
) {
  require("dotenv").config();
}

// Sequelize CLI configuration

const sharedConfig = {
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD, // required
  database: process.env.POSTGRES_DB || "postgres",
  dialect: "postgres",
};

module.exports = {
  development: {
    ...sharedConfig,
    host: process.env.POSTGRES_HOST || "localhost",
    port: process.env.DOCKER_POSTGRES_PORT || 5432,
    port: 5432,
  },
  production: {
    ...sharedConfig,
    host: process.env.POSTGRES_HOST || "db",
    port: process.env.POSTGRES_PORT || 5432,
  },
};
