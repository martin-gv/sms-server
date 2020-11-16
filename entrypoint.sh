#!/bin/sh

# Set environment variable for psql
export PGPASSWORD=$POSTGRES_PASSWORD

# Wait for Postgres
until psql -h "db" -U "postgres" -c '\q'; do
    >&2 echo "Postgres is unavailable. Sleeping..."
    sleep 1
done

>&2 echo "Postgres is up"

# Run database migrations
npx sequelize-cli db:migrate

# Start server
node app.js