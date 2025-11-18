#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Darevel Chat - Java Backend Development Setup     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is running
echo -e "${YELLOW}🔍 Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check if Maven is installed
echo -e "${YELLOW}🔍 Checking Maven...${NC}"
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}❌ Maven is not installed. Please install Maven 3.6+ and try again.${NC}"
    exit 1
fi
MAVEN_VERSION=$(mvn -v | head -n 1)
echo -e "${GREEN}✅ $MAVEN_VERSION${NC}"
echo ""

# Check if Java is installed
echo -e "${YELLOW}🔍 Checking Java...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed. Please install Java 17+ and try again.${NC}"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -n 1)
echo -e "${GREEN}✅ $JAVA_VERSION${NC}"
echo ""

# Option 1: Docker Compose (Recommended)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Choose your development mode:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}1)${NC} Docker Compose (Recommended - All services in containers)"
echo -e "  ${GREEN}2)${NC} Local Development (PostgreSQL in Docker, services run locally)"
echo ""
read -p "Select option (1 or 2): " option
echo ""

if [ "$option" = "1" ]; then
    echo -e "${YELLOW}🐳 Starting services with Docker Compose...${NC}"
    echo ""

    # Check if services are already running
    if docker-compose ps | grep -q "Up"; then
        echo -e "${YELLOW}⚠️  Services are already running. Stopping them first...${NC}"
        docker-compose down
        echo ""
    fi

    # Build and start services
    echo -e "${YELLOW}📦 Building Docker images...${NC}"
    docker-compose build
    echo ""

    echo -e "${YELLOW}🚀 Starting all services...${NC}"
    docker-compose up -d
    echo ""

    # Wait for services to be healthy
    echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
    sleep 10

    echo -e "${GREEN}✅ All services started!${NC}"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  Services are now running:${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  🔐 Auth Service:        ${GREEN}http://localhost:8081${NC}"
    echo -e "  💬 Chat Service:        ${GREEN}http://localhost:8082${NC}"
    echo -e "  🔑 Permissions Service: ${GREEN}http://localhost:8083${NC}"
    echo -e "  🗄️  PostgreSQL:          ${GREEN}localhost:5432${NC}"
    echo -e "  📊 Prometheus:          ${GREEN}http://localhost:9090${NC}"
    echo -e "  📈 Grafana:             ${GREEN}http://localhost:3001${NC} (admin/admin)"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}📝 Useful commands:${NC}"
    echo -e "  - View logs:          ${BLUE}docker-compose logs -f${NC}"
    echo -e "  - View specific logs: ${BLUE}docker-compose logs -f auth-service${NC}"
    echo -e "  - Stop services:      ${BLUE}docker-compose down${NC}"
    echo -e "  - Restart services:   ${BLUE}docker-compose restart${NC}"
    echo ""

elif [ "$option" = "2" ]; then
    echo -e "${YELLOW}🛠️  Starting Local Development Mode...${NC}"
    echo ""

    # Start PostgreSQL
    echo -e "${YELLOW}🐘 Starting PostgreSQL...${NC}"
    if docker ps -a | grep -q darevel-postgres; then
        docker start darevel-postgres > /dev/null 2>&1
    else
        docker run -d \
            --name darevel-postgres \
            -e POSTGRES_USER=darevel_chat \
            -e POSTGRES_PASSWORD=darevel_chat123 \
            -e POSTGRES_DB=darevel_chat \
            -p 5432:5432 \
            postgres:15-alpine
    fi
    echo ""

    # Wait for PostgreSQL
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    for i in {1..30}; do
        if docker exec darevel-postgres pg_isready -U darevel_chat > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
    echo ""

    # Build services
    echo -e "${YELLOW}🔨 Building all services...${NC}"
    mvn clean install -DskipTests
    echo ""

    echo -e "${GREEN}✅ Services built successfully!${NC}"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  Starting services in separate terminals...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Please run these commands in separate terminals:${NC}"
    echo ""
    echo -e "  Terminal 1 (Auth Service):"
    echo -e "    ${BLUE}cd apps/chat/backend-java/auth-service && mvn spring-boot:run${NC}"
    echo ""
    echo -e "  Terminal 2 (Chat Service):"
    echo -e "    ${BLUE}cd apps/chat/backend-java/chat-service && mvn spring-boot:run${NC}"
    echo ""
    echo -e "  Terminal 3 (Permissions Service):"
    echo -e "    ${BLUE}cd apps/chat/backend-java/permissions-service && mvn spring-boot:run${NC}"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Or use npm script to start all services:${NC}"
    echo -e "    ${BLUE}npm run services:start${NC}"
    echo ""
else
    echo -e "${RED}❌ Invalid option. Please run the script again and choose 1 or 2.${NC}"
    exit 1
fi
