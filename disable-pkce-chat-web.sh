#!/bin/bash

# CONFIGURATION
KC_URL="http://localhost:8080"
REALM="master"
USERNAME="admin"
PASSWORD="admin"
CLIENT_ID="chat-web"

echo ">>> Getting admin token..."
TOKEN=$(curl -s -X POST "$KC_URL/realms/$REALM/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=admin-cli" \
  -d "username=$USERNAME" \
  -d "password=$PASSWORD" \
  -d "grant_type=password" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "ERROR: Unable to obtain admin token"
  exit 1
fi

echo ">>> Token received"

echo ">>> Searching for client ID of '$CLIENT_ID'..."
CLIENT_UID=$(curl -s -X GET "$KC_URL/admin/realms/$REALM/clients" \
  -H "Authorization: Bearer $TOKEN" | jq -r ".[] | select(.clientId==\"$CLIENT_ID\") | .id")

if [ -z "$CLIENT_UID" ]; then
  echo "ERROR: Client '$CLIENT_ID' not found"
  exit 1
fi

echo ">>> Client ID: $CLIENT_UID"

echo ">>> Disabling PKCE for '$CLIENT_ID'..."
curl -s -X PUT "$KC_URL/admin/realms/$REALM/clients/$CLIENT_UID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"attributes":{"pkce.code.challenge.method":"none"}}'

echo ">>> PKCE disabled successfully."

echo ">>> Verifying..."
curl -s -X GET "$KC_URL/admin/realms/$REALM/clients/$CLIENT_UID" \
  -H "Authorization: Bearer $TOKEN" | jq '.attributes'
