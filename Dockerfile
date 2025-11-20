# Build stage
FROM node:lts-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Serve stage
FROM node:lts-alpine
WORKDIR /app

# Copy package files and install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy the built application
COPY --from=build /app/build ./build

# Copy .env if provided at build time (optional). In most setups, you'll provide env at runtime.
COPY .env ./.env

# Expose the port the app runs on
EXPOSE 3000

# Set environment variable for the port
ENV PORT=3000

# Start the application after loading environment variables
CMD ["node", "-r", "dotenv/config", "build/index.js"]