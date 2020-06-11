"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Users", "emailNotificationRecipients", {
      type: Sequelize.DataTypes.TEXT,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Users", "emailNotificationRecipients");
  },
};
