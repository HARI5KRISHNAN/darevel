#!/bin/bash
set -e

echo "================================================"
echo "  Darevel Suite - Starting All Applications"
echo "================================================"
echo ""

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running. Please start Docker first."
    exit 1
fi

echo "[1/4] Starting Infrastructure (Keycloak, PostgreSQL)..."
cd "$ROOT_DIR/infrastructure"
docker-compose up -d

echo ""
echo "[2/4] Waiting for infrastructure to be ready (30 seconds)..."
sleep 30

echo ""
echo "[3/4] Starting Backend Services..."

# Start Mail Backend (port 8081)
echo "  - Starting Mail Backend (port 8081)..."
cd "$ROOT_DIR/apps/mail/backend/mail-service"
./mvnw spring-boot:run &

# Start Chat Backend (port 8082)
echo "  - Starting Chat Backend (port 8082)..."
cd "$ROOT_DIR/apps/chat/backend-java/chat-service"
../mvnw spring-boot:run &

# Start Sheet Backend (port 8083)
echo "  - Starting Sheet Backend (port 8083)..."
cd "$ROOT_DIR/apps/sheet/backend"
./mvnw spring-boot:run &

# Start Slides Backend (port 8084)
echo "  - Starting Slides Backend (port 8084)..."
cd "$ROOT_DIR/apps/slides/backend"
"$ROOT_DIR/apps/sheet/backend/mvnw" spring-boot:run &

# Start Suite Backend (port 8085)
echo "  - Starting Suite Backend (port 8085)..."
cd "$ROOT_DIR/apps/suite/backend"
"$ROOT_DIR/apps/sheet/backend/mvnw" spring-boot:run &

echo ""
echo "[4/4] Starting Frontend Applications..."
echo "  Waiting for backends to initialize (15 seconds)..."
sleep 15

cd "$ROOT_DIR"

# Start all frontends
echo "  - Starting Slides (port 3000)..."
cd "$ROOT_DIR/apps/slides" && npm run dev &

echo "  - Starting Suite (port 3002)..."
cd "$ROOT_DIR/apps/suite" && npm run dev &

echo "  - Starting Chat (port 3003)..."
cd "$ROOT_DIR/apps/chat" && npm run dev &

echo "  - Starting Sheet (port 3004)..."
cd "$ROOT_DIR/apps/sheet" && npm run dev &

echo "  - Starting Mail (port 3008)..."
cd "$ROOT_DIR/apps/mail" && npm run dev &

echo ""
echo "================================================"
echo "  All Applications Starting!"
echo "================================================"
echo ""
echo "  Infrastructure:"
echo "    - Keycloak:    http://localhost:8180 (admin/admin)"
echo "    - PostgreSQL:  localhost:5432"
echo ""
echo "  Frontend Applications:"
echo "    - Slides:      http://localhost:3000"
echo "    - Suite:       http://localhost:3002"
echo "    - Chat:        http://localhost:3003"
echo "    - Sheet:       http://localhost:3004"
echo "    - Mail:        http://localhost:3008"
echo ""
echo "  Backend Services:"
echo "    - Mail API:    http://localhost:8081"
echo "    - Chat API:    http://localhost:8082"
echo "    - Sheet API:   http://localhost:8083"
echo "    - Slides API:  http://localhost:8084"
echo "    - Suite API:   http://localhost:8085"
echo ""
echo "  Test Users: alice/password, bob/password, admin/admin123"
echo "================================================"

wait
