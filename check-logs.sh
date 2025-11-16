#!/bin/bash
echo "=== Auth Service Logs ==="
docker logs darevel-auth-service --tail 50 2>&1 | grep -i "error\|exception" | tail -20
echo ""
echo "=== Chat Service Logs ==="
docker logs darevel-chat-service --tail 50 2>&1 | grep -i "error\|exception" | tail -20
