#!/bin/bash
# Darevel Suite - Backend Build & Startup Script
# This script builds all microservices and starts the infrastructure

set -e

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRASTRUCTURE_DIR="$WORKSPACE_ROOT/infrastructure"

echo "========================================="
echo "Darevel Suite - Backend Build & Startup"
echo "========================================="
echo ""

# Load environment variables
if [ -f "$WORKSPACE_ROOT/.env" ]; then
    echo "Loading .env configuration..."
    export $(cat "$WORKSPACE_ROOT/.env" | grep -v '^#' | xargs)
else
    echo "Warning: .env file not found. Using defaults."
fi

# Set default values if not in .env
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
KEYCLOAK_HOSTNAME="${KEYCLOAK_HOSTNAME:-localhost:8080}"
KEYCLOAK_PORT="${KEYCLOAK_PORT:-8080}"

echo "Configuration:"
echo "  DB Host: $DB_HOST:$DB_PORT"
echo "  Keycloak: http://$KEYCLOAK_HOSTNAME"
echo ""

# Step 1: Start infrastructure (PostgreSQL + Keycloak)
echo "Step 1: Starting infrastructure services (PostgreSQL + Keycloak)..."
cd "$INFRASTRUCTURE_DIR"
docker-compose up -d
echo "✓ Infrastructure started"
echo ""

# Step 2: Wait for services to be ready
echo "Step 2: Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec darevel-postgres pg_isready -U $POSTGRES_USER > /dev/null 2>&1; then
        echo "✓ PostgreSQL is ready"
        break
    fi
    echo "  Waiting... ($i/30)"
    sleep 2
done
echo ""

# Step 3: Build all backend services
echo "Step 3: Building backend microservices..."
cd "$WORKSPACE_ROOT"

SERVICES=("chat/backend" "sheet/backend" "mail/backend" "slides/backend" "suite/backend")
for service in "${SERVICES[@]}"; do
    SERVICE_NAME=$(basename $(dirname $service))
    echo "  Building apps/$service..."
    cd "apps/$service"
    mvn clean package -DskipTests -q
    cd "$WORKSPACE_ROOT"
done
echo "✓ All services built successfully"
echo ""

# Step 4: Start all backend services in background
echo "Step 4: Starting all backend microservices..."
export JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS:--Duser.timezone=UTC}"

declare -A SERVICE_PORTS=(
    ["chat"]="8081"
    ["sheet"]="8082"
    ["mail"]="8083"
    ["slides"]="8084"
    ["suite"]="8085"
)

for service in "${!SERVICE_PORTS[@]}"; do
    port="${SERVICE_PORTS[$service]}"
    jar_file="apps/$service/backend/target/darevel-${service}-backend-1.0.0.jar"
    
    if [ -f "$jar_file" ]; then
        echo "  Starting $service service on port $port..."
        nohup java \
            -DSERVER_PORT=$port \
            -DDB_HOST=$DB_HOST \
            -DDB_PORT=$DB_PORT \
            -DPOSTGRES_USER=$POSTGRES_USER \
            -DPOSTGRES_PASSWORD=$POSTGRES_PASSWORD \
            -DKEYCLOAK_ISSUER="http://$KEYCLOAK_HOSTNAME/realms/darevel" \
            -jar "$jar_file" > "logs/${service}-service.log" 2>&1 &
    else
        echo "  Warning: JAR not found for $service: $jar_file"
    fi
done
echo "✓ All services started (check logs/ folder for details)"
echo ""

echo "========================================="
echo "✓ Darevel Suite is ready!"
echo "========================================="
echo ""
echo "Available services:"
echo "  - Dashboard: http://localhost:3000"
echo "  - Chat API: http://localhost:8081/api"
echo "  - Sheet API: http://localhost:8082/api"
echo "  - Mail API: http://localhost:8083/api"
echo "  - Slides API: http://localhost:8084/api"
echo "  - Dashboard API: http://localhost:8085/api"
echo "  - Keycloak: http://$KEYCLOAK_HOSTNAME"
echo ""
