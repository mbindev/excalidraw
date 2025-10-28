FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN npm install --production || yarn install --frozen-lockfile --production

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build || yarn build

# Remove dev dependencies and source
RUN npm prune --production || yarn install --production --ignore-scripts --prefer-offline
RUN rm -rf src tsconfig.json

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start server
CMD ["node", "dist/index.js"]
