# Multi-stage Dockerfile for Nekxuz B2B Platform
# Optimized for production deployment

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install to update lock file if needed)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Production runtime
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init postgresql-client

# Create app user for security (using GID 1001 to avoid conflicts)
RUN addgroup -g 1001 appuser && adduser -D -u 1001 -G appuser appuser

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev deps needed for prisma generate)
RUN npm install --legacy-peer-deps

# Copy backend code
COPY server.js .
COPY shiprocket.js .
COPY prisma ./prisma
COPY public ./public

# Generate Prisma client (required for Prisma ORM to work)
RUN npx prisma generate

# Copy built frontend from builder
COPY --from=frontend-builder /app/build ./build

# Clean up - remove dev dependencies to keep image small
RUN npm install --only=production --legacy-peer-deps --no-save && npm cache clean --force

# Create directories for logs and data
RUN mkdir -p /app/logs && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose ports
EXPOSE 3002

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "server.js"]
