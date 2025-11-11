#!/bin/bash

# Start services in development mode with mvn spring-boot:run
# This enables hot reload and debugging capabilities

echo "🚀 Starting Darevel services in DEVELOPMENT mode..."
echo "   Using mvn spring-boot:run for hot reload"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

# Start services
echo "Starting infrastructure services (postgres, keycloak, redis)..."
docker-compose up -d postgres postgres-app keycloak redis nginx

echo ""
echo "Waiting for services to be healthy..."
sleep 10

echo ""
echo "Starting microservices in development mode..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d user-service drive-service api-gateway

echo ""
echo "✅ Development environment started!"
echo ""
echo "📋 Service URLs:"
echo "   - API Gateway:  http://localhost:8081"
echo "   - User Service: http://localhost:8082"
echo "   - Drive Service: http://localhost:8083"
echo "   - Keycloak:     http://localhost:8080"
echo ""
echo "🐛 Debug Ports:"
echo "   - User Service:  5005"
echo "   - Drive Service: 5006"
echo "   - API Gateway:   5007"
echo ""
echo "📝 View logs:"
echo "   docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f [service-name]"
echo ""
echo "🔄 Code changes in src/ will trigger automatic reload"
echo ""
echo "🛑 To stop: docker-compose -f docker-compose.yml -f docker-compose.dev.yml down"
