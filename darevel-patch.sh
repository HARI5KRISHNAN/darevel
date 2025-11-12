#!/usr/bin/env bash
set -euo pipefail

# === Darevel patch script (BASH) ===
# - Finds all .env and .env.local files under current directory
# - Backs them up (.bak)
# - Replaces pilot180 -> darevel
# - Replaces localhost:8080 -> keycloak.darevel.local:8080
# - Adjusts common redirect_uri / issuer hosts containing pilot180
# - Reports changes and deletes this script at the end

ROOT="$(pwd)"
echo "Running Darevel patch from: $ROOT"

# File patterns to patch (modify if your env files are named differently)
PATTERNS=( ".env" ".env.local" )

# Collect files
MAPFILE=()
while IFS= read -r -d '' file; do
  MAPFILE+=("$file")
done < <(find . -type f \( -name ".env" -o -name ".env.local" \) -print0)

if [ ${#MAPFILE[@]} -eq 0 ]; then
  echo "No .env or .env.local files found. Exiting."
  # self delete
  rm -- "$0" || true
  exit 0
fi

echo "Found ${#MAPFILE[@]} env file(s) to patch."

# Use Python for robust in-file replacements (works on Windows if Python is present)
python_replacer() {
  python - <<'PY' || return 1
import sys,io,os,re
files = sys.argv[1:]
for path in files:
    with open(path, "rb") as f:
        raw = f.read()
    try:
        text = raw.decode("utf-8")
    except:
        text = raw.decode("latin-1")
    orig = text
    # Replacements
    text = text.replace("pilot180", "darevel")
    text = text.replace("localhost:8080", "keycloak.darevel.local:8080")
    # replace a few common issuer/redirect patterns:
    text = re.sub(r"(https?://)(localhost|127\\.0\\.0\\.1)(:8080)?(/realms/)[^/\\s]+", r"\1keycloak.darevel.local:8080\4darevel", text)
    text = re.sub(r"(redirect_uri=)https?%3A%2F%2Flocalhost%3A300(\d)%2F", r"\1http%3A%2F%2Fsuite.darevel.local%2F", text)
    if text != orig:
        # write backup and new
        with open(path + ".bak", "wb") as b:
            b.write(orig.encode("utf-8"))
        with open(path, "wb") as f:
            f.write(text.encode("utf-8"))
        print("patched:", path)
    else:
        print("no-change:", path)
PY
}

# Run on each file
CHANGED=0
for f in "${MAPFILE[@]}"; do
  echo "Processing: $f"
  if python_replacer "$f"; then
    CHANGED=$((CHANGED+1))
  fi
done

echo ""
echo "Patched files: $CHANGED / ${#MAPFILE[@]} (backups saved with .bak)"
echo "If something went wrong, restore from filename.bak"

# Self-delete script
echo "Removing patch script ($0)..."
rm -- "$0" || true
echo "Done."
