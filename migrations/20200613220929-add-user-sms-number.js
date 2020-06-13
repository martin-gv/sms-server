"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  up: (queryInterface) => {
    return queryInterface.addColumn("Users", "smsNumber", {
      // Stored as TEXT because phone numbers aren't
      // true numbers but "collections of digits"
      type: DataTypes.TEXT,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn("Users", "smsNumber");
  },
};
