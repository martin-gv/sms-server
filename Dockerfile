# SMS Server

ARG DOCKER_ENV

FROM node:14.15.0 as base

# Create and set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
FROM base AS deps-development
RUN npm install

FROM base AS deps-production
RUN npm ci --only-production

FROM deps-${DOCKER_ENV} AS deps-final

# Copy application code
COPY . ./

# Expose the port of the Node application
EXPOSE 8080

USER node

# Start container
FROM deps-final AS cmd-development
CMD ["npm", "run", "dev-docker"]

FROM deps-final AS cmd-production
ENV NODE_ENV=production
ENTRYPOINT ["node", "app.js"]

FROM cmd-${DOCKER_ENV} AS cmd-final
