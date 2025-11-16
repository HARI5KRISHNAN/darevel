#!/bin/bash

# Automated Development Setup Script
# Starts PostgreSQL and Backend Server

set -e

echo "🚀 Starting Whooper Chat Backend..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. Installing PostgreSQL manually is required."
    echo "   Or install Docker: https://docs.docker.com/get-docker/"
    echo ""
    echo "🔄 Starting backend without database auto-setup..."
    npm run dev:server
    exit 0
fi

# Check if PostgreSQL container is already running
if docker ps | grep -q whooper-postgres; then
    echo "✅ PostgreSQL already running"
else
    # Check if container exists but is stopped
    if docker ps -a | grep -q whooper-postgres; then
        echo "🔄 Starting existing PostgreSQL container..."
        docker start whooper-postgres
    else
        echo "📦 Starting PostgreSQL container..."
        docker-compose up -d postgres

        # Wait for PostgreSQL to be ready
        echo "⏳ Waiting for PostgreSQL to be ready..."
        timeout=30
        counter=0
        until docker exec whooper-postgres pg_isready -U whooper > /dev/null 2>&1; do
            counter=$((counter + 1))
            if [ $counter -gt $timeout ]; then
                echo "❌ PostgreSQL failed to start in time"
                exit 1
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
