#!/bin/bash

# 🚀 Nekxuz B2B Platform - Quick Production Launch Script
# This script automates common deployment tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Main menu
show_menu() {
    print_header "🚀 Nekxuz B2B Platform - Deployment Menu"
    echo ""
    echo "Select deployment option:"
    echo "1) Local Development Setup"
    echo "2) Production Build"
    echo "3) Deploy to Production (VPS)"
    echo "4) Docker Build & Run"
    echo "5) Database Migration"
    echo "6) Security Audit"
    echo "7) Performance Check"
    echo "8) View Logs"
    echo "9) Health Check"
    echo "0) Exit"
    echo ""
    read -p "Enter choice [0-9]: " choice
}

# 1. Local Development
local_dev() {
    print_header "Local Development Setup"
    
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
    
    print_info "Starting backend..."
    node server.js > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    print_success "Backend started (PID: $BACKEND_PID)"
    
    sleep 2
    
    print_info "Starting frontend..."
    npm start &
    print_success "Frontend started"
    
    print_info "Waiting for services to start..."
    sleep 5
    
    print_header "Development Environment Ready"
    echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
    echo -e "${GREEN}Backend: http://localhost:3002${NC}"
    echo -e "${GREEN}API: http://localhost:3002/api${NC}"
}

# 2. Production Build
production_build() {
    print_header "Production Build"
    
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found"
        print_info "Creating .env.production template..."
        cp .env .env.production
        print_warning "Please edit .env.production with production values"
        return 1
    fi
    
    print_info "Building frontend..."
    npm run build
    print_success "Frontend build complete"
    
    print_info "Checking backend..."
    npm list > /dev/null 2>&1
    print_success "Backend dependencies verified"
    
    print_header "Build Verification"
    print_info "Frontend build size:"
    du -sh build/
    print_info "Backend size:"
    du -sh .
}

# 3. Deploy to VPS
deploy_vps() {
    print_header "Deploy to VPS"
    
    read -p "Enter VPS server IP/domain: " SERVER
    read -p "Enter SSH user (default: root): " SSH_USER
    SSH_USER=${SSH_USER:-root}
    
    print_info "Uploading to $SERVER..."
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude 'build' \
        --exclude '.env' \
        ./ $SSH_USER@$SERVER:/var/www/nekxuz/
    print_success "Upload complete"
    
    print_info "Running deployment commands..."
    ssh $SSH_USER@$SERVER << 'REMOTE_COMMANDS'
cd /var/www/nekxuz
npm install
npm run build
npx prisma migrate deploy
pm2 restart nekxuz-api || pm2 start server.js --name nekxuz-api
REMOTE_COMMANDS
    
    print_success "Deployment complete"
}

# 4. Docker Build & Run
docker_build() {
    print_header "Docker Build & Run"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        return 1
    fi
    
    print_info "Building Docker image..."
    docker build -t nekxuz:latest .
    print_success "Docker image built"
    
    print_info "Starting containers with docker-compose..."
    docker-compose up -d
    print_success "Containers started"
    
    sleep 3
    
    print_header "Docker Status"
    docker-compose ps
}

# 5. Database Migration
database_migration() {
    print_header "Database Migration"
    
    print_info "Checking Prisma schema..."
    if grep -q 'provider = "postgresql"' prisma/schema.prisma; then
        print_success "PostgreSQL provider configured"
    else
        print_warning "SQLite provider detected, switching to PostgreSQL..."
        sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    fi
    
    print_info "Running migrations..."
    npx prisma migrate deploy
    print_success "Migration complete"
    
    print_info "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
}

# 6. Security Audit
security_audit() {
    print_header "Security Audit"
    
    print_info "Running npm audit..."
    npm audit --audit-level=moderate || print_warning "Some vulnerabilities found, review above"
    
    print_info "Checking environment variables..."
    required_vars=("DATABASE_URL" "RAZORPAY_KEY_ID" "SHIPROCKET_EMAIL")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_warning "Missing $var in .env"
        else
            print_success "✓ $var configured"
        fi
    done
    
    print_info "Checking for secrets in code..."
    if grep -r "AKIA\|-----BEGIN PRIVATE KEY" --exclude-dir=node_modules . 2>/dev/null | grep -v ".git"; then
        print_error "Potential secrets found in codebase"
    else
        print_success "No obvious secrets found"
    fi
    
    print_info "Checking API endpoints..."
    if lsof -i :3002 > /dev/null 2>&1; then
        curl -s http://localhost:3002/health | jq '.' && print_success "Backend health check passed"
    else
        print_warning "Backend not running"
    fi
}

# 7. Performance Check
performance_check() {
    print_header "Performance Check"
    
    if ! lsof -i :3002 > /dev/null 2>&1; then
        print_error "Backend not running"
        return 1
    fi
    
    print_info "Testing API response times..."
    
    endpoints=(
        "/api/stock"
        "/api/products"
        "/api/orders?email=test@test.com"
    )
    
    for endpoint in "${endpoints[@]}"; do
        start_time=$(date +%s%N)
        response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002$endpoint)
        end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 ))
        
        if [ "$response" = "200" ] || [ "$response" = "400" ]; then
            print_success "$endpoint: ${response_time}ms (HTTP $response)"
        else
            print_error "$endpoint: HTTP $response"
        fi
    done
    
    print_info "Checking database performance..."
    echo "SELECT COUNT(*) FROM \"Order\";" | psql $DATABASE_URL 2>/dev/null && print_success "Database connection OK" || print_warning "Database not accessible"
}

# 8. View Logs
view_logs() {
    print_header "View Logs"
    
    echo "1) Backend logs"
    echo "2) Frontend logs"
    echo "3) System logs"
    read -p "Select [1-3]: " log_choice
    
    case $log_choice in
        1)
            print_info "Backend logs (last 50 lines):"
            tail -50 /tmp/backend.log
            ;;
        2)
            print_info "Frontend logs:"
            lsof -i :3004 | grep node | awk '{print $2}' | xargs -I {} kill -3 {} || echo "Frontend not running"
            ;;
        3)
            print_info "System resource usage:"
            echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')"
            echo "Memory: $(free -h | awk 'NR==2 {print $3" / "$2}')"
            echo "Disk: $(df -h / | awk 'NR==2 {print $3" / "$2}')"
            ;;
    esac
}

# 9. Health Check
health_check() {
    print_header "System Health Check"
    
    checks_passed=0
    checks_total=0
    
    # Backend check
    checks_total=$((checks_total + 1))
    if curl -s http://localhost:3002/health | jq . > /dev/null 2>&1; then
        print_success "Backend health: OK"
        checks_passed=$((checks_passed + 1))
    else
        print_error "Backend health: FAILED"
    fi
    
    # Frontend check
    checks_total=$((checks_total + 1))
    if lsof -i :3004 > /dev/null 2>&1; then
        print_success "Frontend: OK"
        checks_passed=$((checks_passed + 1))
    else
        print_warning "Frontend: NOT RUNNING"
    fi
    
    # Database check
    checks_total=$((checks_total + 1))
    if [ ! -z "$DATABASE_URL" ]; then
        if echo "SELECT 1;" | psql $DATABASE_URL > /dev/null 2>&1; then
            print_success "Database: OK"
            checks_passed=$((checks_passed + 1))
        else
            print_error "Database: FAILED"
        fi
    fi
    
    # Disk space check
    checks_total=$((checks_total + 1))
    disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $disk_usage -lt 80 ]; then
        print_success "Disk usage: ${disk_usage}% (OK)"
        checks_passed=$((checks_passed + 1))
    else
        print_warning "Disk usage: ${disk_usage}% (HIGH)"
    fi
    
    echo ""
    print_header "Health Check Summary"
    echo "Passed: $checks_passed / $checks_total"
    
    if [ $checks_passed -eq $checks_total ]; then
        print_success "All systems operational!"
    else
        print_warning "Some systems require attention"
    fi
}

# Main loop
while true; do
    show_menu
    case $choice in
        1) local_dev ;;
        2) production_build ;;
        3) deploy_vps ;;
        4) docker_build ;;
        5) database_migration ;;
        6) security_audit ;;
        7) performance_check ;;
        8) view_logs ;;
        9) health_check ;;
        0) print_success "Goodbye!"; exit 0 ;;
        *) print_error "Invalid option" ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
