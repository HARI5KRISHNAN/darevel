#!/bin/bash
# Reset Keycloak realm data to force fresh import

echo "Stopping Keycloak container..."
docker stop darevel-keycloak 2>/dev/null || true

echo "Removing Keycloak container..."
docker rm darevel-keycloak 2>/dev/null || true

echo "Connecting to PostgreSQL and dropping Keycloak database..."
docker exec darevel-postgres psql -U postgres -c "DROP DATABASE IF EXISTS keycloak;"
docker exec darevel-postgres psql -U postgres -c "CREATE DATABASE keycloak;"

echo "Restarting Keycloak..."
cd "$(dirname "$0")"
docker-compose up -d keycloak

echo "Waiting for Keycloak to start..."
sleep 30

echo "Keycloak has been reset. The darevel realm should now be imported fresh."
echo "Access Keycloak Admin Console at: http://localhost:8180"
echo "Admin credentials: admin / admin"
