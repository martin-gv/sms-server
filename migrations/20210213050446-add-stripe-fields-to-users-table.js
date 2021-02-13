"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "Users",
          "stripeCustomerId",
          { type: Sequelize.DataTypes.TEXT, unique: true },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "Users",
          "subscriptionStatus",
          {
            type: Sequelize.DataTypes.ENUM("ACTIVE", "INACTIVE"),
            defaultValue: "INACTIVE",
            allowNull: false,
          },
          { transaction: t }
        ),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("Users", "stripeCustomerId", {
          transaction: t,
        }),
        queryInterface.removeColumn("Users", "subscriptionStatus", {
          transaction: t,
        }),
        queryInterface.sequelize.query(
          'DROP TYPE "enum_Users_subscriptionStatus";',
          { transaction: t }
        ),
      ]);
    });
  },
};
