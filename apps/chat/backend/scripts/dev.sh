#!/bin/bash

# Automated Development Setup Script
# Starts PostgreSQL and Backend Server

set -e

echo "🚀 Starting Darevel Chat Backend..."
echo ""

# Check if PostgreSQL is already running on port 5432
if nc -z localhost 5432 2>/dev/null || (exec 3<>/dev/tcp/localhost/5432) 2>/dev/null; then
    echo "✅ PostgreSQL already running on port 5432"
    echo "   Using existing PostgreSQL instance"
    echo ""
    echo "🔧 Starting backend server..."
    npm run dev:server
    exit 0
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. PostgreSQL is not running."
    echo ""
    echo "Options:"
    echo "1. Install Docker: https://docs.docker.com/get-docker/"
    echo "2. Install PostgreSQL locally: sudo apt install postgresql"
    echo "3. Backend will use in-memory storage (temporary)"
    echo ""
    echo "🔄 Starting backend with in-memory storage..."
    npm run dev:server
    exit 0
fi

# Check if PostgreSQL container is already running
if docker ps | grep -q darevel-chat-postgres; then
    echo "✅ PostgreSQL container already running"
else
    # Check if container exists but is stopped
    if docker ps -a | grep -q darevel-chat-postgres; then
        echo "🔄 Starting existing PostgreSQL container..."
        docker start darevel-chat-postgres
    else
        echo "📦 Starting PostgreSQL container..."
        docker-compose up -d postgres 2>&1 | grep -v "port is already allocated" || true

        # Wait for PostgreSQL to be ready
        echo "⏳ Waiting for PostgreSQL to be ready..."
        timeout=30
        counter=0
        until docker exec darevel-chat-postgres pg_isready -U darevel_chat > /dev/null 2>&1; do
            counter=$((counter + 1))
            if [ $counter -gt $timeout ]; then
                echo "❌ PostgreSQL failed to start in time"
                echo "   Backend will use in-memory storage"
                npm run dev:server
                exit 0
            fi
            echo "   Waiting... ($counter/$timeout)"
            sleep 1
        done
    fi
    echo "✅ PostgreSQL is ready!"
fi

echo ""
echo "🔧 Starting backend server..."
npm run dev:server
