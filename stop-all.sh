#!/bin/bash

# Darevel Suite - Stop Script
# This script stops all running services

DAREVEL_DIR="/home/user/darevel"

echo "🛑 Stopping Darevel Suite..."
echo ""

# Stop Docker services
echo "📦 Stopping Docker services..."
cd "$DAREVEL_DIR"
docker-compose down

echo ""
echo "🎨 Stopping frontend applications..."

# Kill all npm dev processes
if [ -f "$DAREVEL_DIR/.pids" ]; then
    echo "   Stopping apps by PID..."
    source "$DAREVEL_DIR/.pids"

    for pid in $SUITE_PID $AUTH_PID $CHAT_PID $MAIL_PID $DRIVE_PID $EXCEL_PID $SLIDES_PID $NOTIFY_PID; do
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null && echo "   • Stopped process $pid"
        fi
    done

    rm "$DAREVEL_DIR/.pids"
else
    echo "   Stopping all 'npm run dev' processes..."
    pkill -f "npm run dev" 2>/dev/null && echo "   • All npm processes stopped" || echo "   • No npm processes found"
fi

echo ""
echo "✅ Darevel Suite stopped!"
