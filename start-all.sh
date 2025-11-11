#!/bin/bash

# Darevel Suite - Quick Start Script
# This script starts all infrastructure and frontend applications

set -e

# Detect the directory where this script is located
DAREVEL_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$DAREVEL_DIR/logs"

echo "🚀 Starting Darevel Suite..."
echo ""

# Create logs directory
mkdir -p "$LOG_DIR"

# Step 1: Start Docker services
echo "📦 Step 1/3: Starting Docker infrastructure..."
cd "$DAREVEL_DIR"
docker-compose up -d postgres postgres-app keycloak redis nginx

echo "⏳ Waiting for Keycloak to start (this may take 1-2 minutes)..."
echo "   You can monitor progress: docker logs -f darevel_keycloak"
echo ""

# Wait for Keycloak
MAX_WAIT=120
WAIT_COUNT=0
until docker exec darevel_keycloak curl -sf http://localhost:9000/health/ready > /dev/null 2>&1; do
    sleep 5
    WAIT_COUNT=$((WAIT_COUNT + 5))
    if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
        echo "❌ Keycloak failed to start within ${MAX_WAIT}s"
        echo "   Check logs: docker logs darevel_keycloak"
        exit 1
    fi
    echo "   Still waiting... (${WAIT_COUNT}s)"
done

echo "✅ Keycloak is ready!"
echo ""

# Step 2: Verify services
echo "🔍 Step 2/3: Verifying infrastructure services..."
docker-compose ps

echo ""
echo "Checking Keycloak configuration..."
curl -sf http://localhost:8080/realms/pilot180/.well-known/openid-configuration > /dev/null && \
    echo "✅ Keycloak OpenID configuration is accessible" || \
    echo "❌ Cannot reach Keycloak OpenID endpoint"

echo ""

# Step 3: Start frontend applications
echo "🎨 Step 3/3: Starting frontend applications..."
echo ""
echo "Starting apps in background (logs in $LOG_DIR)..."

# Suite
echo "  • Suite (localhost:3002 -> darevel.local)..."
cd "$DAREVEL_DIR/apps/suite"
npm run dev > "$LOG_DIR/suite.log" 2>&1 &
SUITE_PID=$!
echo "    PID: $SUITE_PID"

# Auth
echo "  • Auth (localhost:3005 -> auth.darevel.local)..."
cd "$DAREVEL_DIR/apps/auth"
npm run dev > "$LOG_DIR/auth.log" 2>&1 &
AUTH_PID=$!
echo "    PID: $AUTH_PID"

# Chat
echo "  • Chat (localhost:3003 -> chat.darevel.local)..."
cd "$DAREVEL_DIR/apps/chat"
npm run dev > "$LOG_DIR/chat.log" 2>&1 &
CHAT_PID=$!
echo "    PID: $CHAT_PID"

# Mail
echo "  • Mail (localhost:3004 -> mail.darevel.local)..."
cd "$DAREVEL_DIR/apps/mail"
npm run dev > "$LOG_DIR/mail.log" 2>&1 &
MAIL_PID=$!
echo "    PID: $MAIL_PID"

# Drive
echo "  • Drive (localhost:3006 -> drive.darevel.local)..."
cd "$DAREVEL_DIR/apps/drive"
npm run dev > "$LOG_DIR/drive.log" 2>&1 &
DRIVE_PID=$!
echo "    PID: $DRIVE_PID"

# Excel
echo "  • Excel (localhost:3001 -> excel.darevel.local)..."
cd "$DAREVEL_DIR/apps/excel"
npm run dev > "$LOG_DIR/excel.log" 2>&1 &
EXCEL_PID=$!
echo "    PID: $EXCEL_PID"

# Slides
echo "  • Slides (localhost:3000 -> slides.darevel.local)..."
cd "$DAREVEL_DIR/apps/slides"
npm run dev > "$LOG_DIR/slides.log" 2>&1 &
SLIDES_PID=$!
echo "    PID: $SLIDES_PID"

# Notify
echo "  • Notify (localhost:3007 -> notify.darevel.local)..."
cd "$DAREVEL_DIR/apps/notify"
npm run dev > "$LOG_DIR/notify.log" 2>&1 &
NOTIFY_PID=$!
echo "    PID: $NOTIFY_PID"

# Wait for apps to start
echo ""
echo "⏳ Waiting for apps to start (30 seconds)..."
sleep 30

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Darevel Suite is now running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Applications:"
echo "   • Suite:  http://localhost:3002 (or http://darevel.local via nginx)"
echo "   • Auth:   http://localhost:3005 (or http://auth.darevel.local via nginx)"
echo "   • Chat:   http://localhost:3003 (or http://chat.darevel.local via nginx)"
echo "   • Mail:   http://localhost:3004 (or http://mail.darevel.local via nginx)"
echo "   • Drive:  http://localhost:3006 (or http://drive.darevel.local via nginx)"
echo "   • Excel:  http://localhost:3001 (or http://excel.darevel.local via nginx)"
echo "   • Slides: http://localhost:3000 (or http://slides.darevel.local via nginx)"
echo "   • Notify: http://localhost:3007 (or http://notify.darevel.local via nginx)"
echo ""
echo "🔐 Test Credentials:"
echo "   Email:    demo@darevel.com"
echo "   Password: demo123"
echo ""
echo "📊 Admin Console:"
echo "   Keycloak: http://localhost:8080 (admin / admin)"
echo ""
echo "📝 Logs:"
echo "   View logs: tail -f $LOG_DIR/<app>.log"
echo "   All logs:  ls -lh $LOG_DIR/"
echo ""
echo "🛑 Stop all:"
echo "   docker-compose down"
echo "   pkill -f 'npm run dev'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Save PIDs to file
cat > "$DAREVEL_DIR/.pids" <<EOF
SUITE_PID=$SUITE_PID
AUTH_PID=$AUTH_PID
CHAT_PID=$CHAT_PID
MAIL_PID=$MAIL_PID
DRIVE_PID=$DRIVE_PID
EXCEL_PID=$EXCEL_PID
SLIDES_PID=$SLIDES_PID
NOTIFY_PID=$NOTIFY_PID
EOF

echo "💡 Tip: Open http://darevel.local in your browser and login to test SSO!"
echo ""
