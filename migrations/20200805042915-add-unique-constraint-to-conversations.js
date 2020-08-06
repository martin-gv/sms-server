"use strict";

module.exports = {
  up: (queryInterface) => {
    return queryInterface.addConstraint("Conversations", {
      type: "UNIQUE",
      fields: ["userId", "contactPhoneNumber"],
      name: "conversations_uniqueConstraint_userId_contactPhoneNumber",
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeConstraint(
      "Conversations",
      "conversations_uniqueConstraint_userId_contactPhoneNumber"
    );
  },
};
