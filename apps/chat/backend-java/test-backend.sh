#!/bin/bash
# Test script for Java backend

echo "=== Testing Java Backend ==="
echo ""

echo "1. Testing Auth Service Health:"
curl -s http://localhost:8081/actuator/health | jq . || curl -s http://localhost:8081/actuator/health
echo -e "\n"

echo "2. Checking if users exist:"
curl -s http://localhost:8081/api/auth/users
echo -e "\n"

echo "3. Testing user registration:"
curl -s -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }' | jq . || curl -s -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
echo -e "\n"

echo "4. Testing message send (should work if user ID 1 exists):"
curl -s -X POST http://localhost:8082/api/chat/general/messages \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "content": "Test message from script"
  }' | jq . || curl -s -X POST http://localhost:8082/api/chat/general/messages \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "content": "Test message from script"
  }'
echo -e "\n"

echo "5. Fetching messages:"
curl -s http://localhost:8082/api/chat/general/messages | jq . || curl -s http://localhost:8082/api/chat/general/messages
echo -e "\n"

echo "=== Test Complete ==="
