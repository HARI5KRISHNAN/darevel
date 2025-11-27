#!/bin/bash

# Whooper API Testing Script
# Tests all backend endpoints to verify Phase 2 implementation

echo "🧪 Whooper API Test Suite"
echo "=========================="
echo ""

BACKEND_URL="http://localhost:5001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4

    echo -n "Testing $name... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BACKEND_URL$endpoint")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ] || [ "$http_code" = "207" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        echo "Response: $(echo $body | head -c 100)..."
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "Response: $body"
    fi
    echo ""
}

# Test 1: Health Check
test_endpoint "Health Check" "GET" "/" ""

# Test 2: Pods List
test_endpoint "Pod List" "GET" "/api/pods/list" ""

# Test 3: Pod List with Namespace Filter
test_endpoint "Pod List (default namespace)" "GET" "/api/pods/list?namespace=default" ""

# Test 4: AI Summary Generation
test_endpoint "AI Summary Generation" "POST" "/api/ai/generate-summary" \
    '{"transcript":"Discussed Q4 planning. Key decisions: Launch new feature by Dec 1, increase team size by 2 members.","title":"Q4 Planning Meeting","participants":["alice@example.com","bob@example.com"]}'

# Test 5: Email Sending (will fail if EMAIL_APP_URL not configured)
echo -e "${YELLOW}Note: Email test may fail if EMAIL_APP_URL is not configured${NC}"
test_endpoint "Email Summary Sending" "POST" "/api/ai/send-summary" \
    '{"subject":"Test Summary","summary":"This is a test summary for Phase 2 verification.","recipients":["test@example.com"]}'

# Test 6: Pod Watch Start (manual trigger)
test_endpoint "Pod Watch Start" "POST" "/api/pods/watch/start" '{"namespace":"default"}'

echo "=========================="
echo "✅ Test Suite Complete!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:5177 in your browser"
echo "2. Click 'Status' to view Pod Dashboard"
echo "3. Test message summary generation in RightSidebar"
echo "4. Try email sending (configure EMAIL_APP_URL first)"
echo ""
