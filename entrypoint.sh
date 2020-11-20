#!/bin/sh

# Run database migrations
npx sequelize-cli db:migrate

# Start server
node app.js