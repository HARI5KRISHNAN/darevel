#!/bin/bash
# Darevel Suite - Port Cleanup Script
# Run this if you get "address already in use" errors

echo "Checking for processes using Darevel Suite ports (3000-3007)..."

for port in {3000..3007}; do
    echo ""
    echo "Checking port $port..."

    # Find PIDs using this port
    pids=$(netstat -ano | grep ":$port" | awk '{print $5}' | sort -u)

    if [ -n "$pids" ]; then
        echo "Port $port is in use. Killing processes..."
        for pid in $pids; do
            if [ "$pid" != "0" ] && [ "$pid" != "" ]; then
                echo "  Killing PID $pid..."
                taskkill //PID $pid //F 2>&1 || echo "  Failed to kill $pid"
            fi
        done
        echo "  Port $port cleared!"
    else
        echo "  Port $port is free"
    fi
done

echo ""
echo "All Darevel Suite ports are now free!"
echo "You can now run: npm run dev"
