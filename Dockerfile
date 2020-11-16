# SMS server

FROM node:14.15.0

# Create and set working directory
WORKDIR /usr/src/app

# Install psql for postgres status check
RUN apt-get update && apt-get --yes install postgresql-client

# Copy package.json
# The wildcard ensures both package.json AND package-lock.json are copied
COPY package*.json ./

# Define build args
ARG dockerenv

# Install dependencies
RUN if [ "$dockerenv" = "production" ]; \
    then npm ci --only=production; \
    else npm install; \
    fi

# Copy application code
COPY . ./

# Set permissions for the entry file
RUN chmod +x entrypoint.sh

# Expose the port
EXPOSE 8080

# Use the unprivileged user 'node'
USER node

# Start script
ENTRYPOINT ["./entrypoint.sh"]
