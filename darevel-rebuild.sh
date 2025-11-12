#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="darevel_keycloak"
REALM_FILE="./darevel-realm.json"
REALM_NAME="darevel"
KC_ADMIN_USER="admin"
KC_ADMIN_PASS="admin"
KC_WAIT_TIMEOUT=60

echo "🔧 Starting fixed Keycloak realm import script"
echo "Container: $CONTAINER_NAME"
echo "Realm file: $REALM_FILE"
echo "Realm name: $REALM_NAME"

if ! docker ps --format '{{.Names}}' | grep -w "$CONTAINER_NAME" >/dev/null; then
  echo "❌ Keycloak container not running. Start Docker Compose first."
  exit 1
fi

echo "⏳ Waiting up to $KC_WAIT_TIMEOUT s for Keycloak (http://localhost:8080)..."
end=$((SECONDS + KC_WAIT_TIMEOUT))
while [ $SECONDS -lt $end ]; do
  if curl -s http://localhost:8080 >/dev/null; then
    echo "✅ Keycloak responded"
    break
  fi
  printf "."
  sleep 2
done
if ! curl -s http://localhost:8080 >/dev/null; then
  echo "❌ Keycloak not reachable after $KC_WAIT_TIMEOUT s"
  exit 1
fi

echo "📦 Copying $REALM_FILE into container..."
docker cp "$REALM_FILE" "$CONTAINER_NAME":/opt/keycloak/data/import/darevel-realm.json

echo "🔎 Detecting Keycloak tools..."
HAS_KCADM=$(docker exec "$CONTAINER_NAME" sh -c 'test -f /opt/keycloak/bin/kcadm.sh && echo yes || echo no')
HAS_KC=$(docker exec "$CONTAINER_NAME" sh -c 'test -f /opt/keycloak/bin/kc.sh && echo yes || echo no')
echo "kcadm.sh: $HAS_KCADM, kc.sh: $HAS_KC"

if [ "$HAS_KCADM" = "yes" ]; then
  echo "🗑️ Removing old realm (if exists)..."
  docker exec "$CONTAINER_NAME" sh -c "
    /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user ${KC_ADMIN_USER} --password ${KC_ADMIN_PASS} || true
    /opt/keycloak/bin/kcadm.sh delete realms/${REALM_NAME} --server http://localhost:8080 || true
  "

  echo "📥 Importing new realm..."
  docker exec "$CONTAINER_NAME" sh -c "
    /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user ${KC_ADMIN_USER} --password ${KC_ADMIN_PASS}
    /opt/keycloak/bin/kcadm.sh create realms -f /opt/keycloak/data/import/darevel-realm.json
  "
  echo "✅ Realm import successful via kcadm.sh"
  exit 0
fi

if [ "$HAS_KC" = "yes" ]; then
  echo "📥 Importing realm using kc.sh..."
  docker exec "$CONTAINER_NAME" sh -c "/opt/keycloak/bin/kc.sh import --file /opt/keycloak/data/import/darevel-realm.json --override true"
  echo "✅ Realm import successful via kc.sh"
  exit 0
fi

echo "❌ Neither kcadm.sh nor kc.sh found inside container!"
docker exec "$CONTAINER_NAME" sh -c "ls -la /opt/keycloak/bin"
exit 1
