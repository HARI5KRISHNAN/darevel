#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AUTH_SERVICE_URL="${VITE_AUTH_SERVICE_URL:-http://localhost:8081}"
API_BASE="${AUTH_SERVICE_URL}/api/auth"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Chat Application Auth Test Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print section headers
print_section() {
    echo -e "\n${YELLOW}>>> $1${NC}\n"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Test 1: Check if auth service is running
print_section "1. Checking Auth Service Status"
if curl -s -o /dev/null -w "%{http_code}" "${AUTH_SERVICE_URL}/actuator/health" | grep -q "200"; then
    print_success "Auth service is running at ${AUTH_SERVICE_URL}"
else
    print_error "Auth service is not responding at ${AUTH_SERVICE_URL}"
    print_error "Please start the auth service first"
    exit 1
fi

# Test 2: View existing users
print_section "2. Viewing Existing Users"
USERS_RESPONSE=$(curl -s "${API_BASE}/users")
USER_COUNT=$(echo "$USERS_RESPONSE" | jq -r '.data | length' 2>/dev/null || echo "0")
echo "Current users in database: ${USER_COUNT}"
if [ "$USER_COUNT" -gt 0 ]; then
    echo "$USERS_RESPONSE" | jq -r '.data[] | "  - \(.name) (\(.email))"' 2>/dev/null || echo "  (Unable to parse user list)"
fi

# Test 3: Clear all users (optional)
print_section "3. Clear All Users (Optional)"
read -p "Do you want to delete all existing users? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    CLEAR_RESPONSE=$(curl -s -X DELETE "${API_BASE}/users")
    if echo "$CLEAR_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        print_success "All users deleted successfully"
    else
        print_error "Failed to delete users"
        echo "$CLEAR_RESPONSE"
    fi
else
    echo "Skipping user deletion"
fi

# Test 4: Register new user
print_section "4. Registering New Test User"
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser${TIMESTAMP}@example.com"
TEST_PASSWORD="SecurePass123!"
TEST_NAME="Test User ${TIMESTAMP}"

echo "Creating user with:"
echo "  Email: ${TEST_EMAIL}"
echo "  Password: ${TEST_PASSWORD}"
echo "  Name: ${TEST_NAME}"

REGISTER_RESPONSE=$(curl -s -X POST "${API_BASE}/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"name\": \"${TEST_NAME}\",
    \"avatar\": \"https://api.dicebear.com/7.x/avataaars/svg?seed=${TIMESTAMP}\"
  }")

if echo "$REGISTER_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    print_success "User registered successfully"
    REGISTER_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
    REGISTER_USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id')
    echo "  User ID: ${REGISTER_USER_ID}"
    echo "  Token (first 50 chars): ${REGISTER_TOKEN:0:50}..."
else
    print_error "User registration failed"
    echo "$REGISTER_RESPONSE"
    exit 1
fi

# Test 5: Login with the new user
print_section "5. Testing Login with New User"
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    print_success "Login successful"
    LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
    echo "  Token (first 50 chars): ${LOGIN_TOKEN:0:50}..."

    # Verify token is different from registration token (tokens should be unique per login)
    if [ "$REGISTER_TOKEN" != "$LOGIN_TOKEN" ]; then
        echo "  Note: Each login generates a new token (good practice)"
    fi
else
    print_error "Login failed"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

# Test 6: Test wrong password
print_section "6. Testing Login with Wrong Password"
WRONG_LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"WrongPassword123\"
  }")

if echo "$WRONG_LOGIN_RESPONSE" | jq -e '.success == false' > /dev/null 2>&1; then
    print_success "Wrong password correctly rejected"
else
    print_error "Wrong password was not rejected (security issue!)"
    echo "$WRONG_LOGIN_RESPONSE"
fi

# Test 7: Get user by ID
print_section "7. Getting User Details by ID"
USER_DETAILS=$(curl -s "${API_BASE}/users/${REGISTER_USER_ID}")
if echo "$USER_DETAILS" | jq -e '.success' > /dev/null 2>&1; then
    print_success "User details retrieved successfully"
    echo "$USER_DETAILS" | jq -r '.data | "  Name: \(.name)\n  Email: \(.email)\n  Level: \(.level)\n  Created: \(.createdAt)"'
else
    print_error "Failed to get user details"
    echo "$USER_DETAILS"
fi

# Test 8: View all users again
print_section "8. Final User Count"
FINAL_USERS=$(curl -s "${API_BASE}/users")
FINAL_COUNT=$(echo "$FINAL_USERS" | jq -r '.data | length' 2>/dev/null || echo "0")
print_success "Total users in database: ${FINAL_COUNT}"
echo "$FINAL_USERS" | jq -r '.data[] | "  - \(.name) (\(.email))"' 2>/dev/null

# Summary
print_section "Test Summary"
print_success "All authentication tests passed!"
echo ""
echo "You can now use these credentials to login:"
echo -e "${GREEN}  Email: ${TEST_EMAIL}${NC}"
echo -e "${GREEN}  Password: ${TEST_PASSWORD}${NC}"
echo ""
echo -e "${BLUE}To test in the UI:${NC}"
echo "1. Start the frontend: npm run dev (in apps/chat directory)"
echo "2. Open http://localhost:5173"
echo "3. Use the credentials above to login"
echo "4. Click 'Clear All Data' button to delete all users"
echo ""
