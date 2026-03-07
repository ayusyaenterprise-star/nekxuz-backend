# Multi-stage Dockerfile for Nekxuz B2B Backend
# Optimized for production deployment

# Production runtime
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init postgresql-client

# Create app user for security
RUN addgroup -g 1001 appuser && adduser -D -u 1001 -G appuser appuser

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock* ./

# Install dependencies using yarn (production only)
RUN yarn install --production && yarn cache clean

# Copy backend code
COPY server.js .
COPY prisma ./prisma
# Note: public/ and frontend build removed - frontend is deployed separately to Hostinger

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
