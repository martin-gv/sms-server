removed

    "operatorsAliases": false

from

    "development": {
        "username": "postgres",
        "password": "password",
        "database": "sms_server",
        "host": "localhost",
        "dialect": "postgres"
    },

to remove deprecation warning

    A boolean value was passed to options.operatorsAliases. This is a no-op with v5 and should be removed.

---

migrations

need to manually add: id, createdAt, updatedAt

---

createdAt, updatedAt fields

automatically updated by Sequelize, not at the SQL level with triggers

when doing direct SQL queries it's important to update these manually

---

If a table name is created with a capital, Sequelize will also create a sequence with the name TableName_id_seq

This occurs in migrations with queryInterface; and in models when using the Model.sync() method when the model name is given with a capital, I assume because Sequelize uses the model name to create a table with the same name (which includes the first letter capital)
