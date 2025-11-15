@echo off
echo === RESETTING DAREVEL REALM ===

REM 1. Login to Keycloak admin CLI inside container
docker exec -it darevel_keycloak sh -c "/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin"

REM 2. Delete old realm (ignore errors)
docker exec -it darevel_keycloak sh -c "/opt/keycloak/bin/kcadm.sh delete realms/darevel || true"

REM 3. Copy new realm JSON into container
docker cp darevel-realm.json darevel_keycloak:/tmp/darevel-realm.json

REM 4. Create realm from JSON
docker exec -it darevel_keycloak sh -c "/opt/keycloak/bin/kcadm.sh create realms -f /tmp/darevel-realm.json"

echo === DONE ===
pause
