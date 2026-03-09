# Dockerfile for Nekxuz Backend API Server
# Backend-only, no frontend build
# Uses node:18-alpine for small image size

FROM node:18-alpine

# Install required system packages for Prisma and databases
RUN apk add --no-cache postgresql-client openssl dumb-init

# Create app user for security
RUN addgroup -g 1001 appuser && adduser -D -u 1001 -G appuser appuser

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev deps for prisma generate)
RUN npm install --legacy-peer-deps

# Copy backend server files
COPY server.js .
COPY shiprocket.js .
COPY prisma ./prisma
COPY .env* ./

# Generate Prisma client (required for Prisma ORM to work)
RUN npx prisma generate

# Sync database schema (must be done before switching to non-root user)
RUN rm -rf node_modules/.prisma/client
RUN npx prisma db push --skip-generate || true
RUN npx prisma generate || true

# Create app directories for logs
RUN mkdir -p /app/logs && chown -R appuser:appuser /app

# Switch to non-root user for security
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3002), (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose default port (Render will override via PORT env var)
EXPOSE 3002

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the backend server
CMD ["npm", "start"]
