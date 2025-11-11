#!/bin/bash

# Darevel Suite - DNS Setup Script
# This script adds the necessary DNS entries to /etc/hosts

echo "Adding Darevel Suite DNS entries to /etc/hosts..."

# Check if entries already exist
if grep -q "darevel.local" /etc/hosts; then
    echo "⚠️  Darevel entries already exist in /etc/hosts"
    echo "Skipping to avoid duplicates."
    exit 0
fi

# Add entries to /etc/hosts
cat <<'EOF' | sudo tee -a /etc/hosts

# Darevel Suite - Local Development
127.0.0.1 darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 notify.darevel.local
127.0.0.1 api.darevel.local
127.0.0.1 keycloak.darevel.local
EOF

echo ""
echo "✅ DNS entries added successfully!"
echo ""
echo "Verifying DNS entries..."
ping -c 1 darevel.local > /dev/null 2>&1 && echo "✅ darevel.local - OK" || echo "❌ darevel.local - FAILED"
ping -c 1 auth.darevel.local > /dev/null 2>&1 && echo "✅ auth.darevel.local - OK" || echo "❌ auth.darevel.local - FAILED"
echo ""
echo "DNS setup complete! You can now start testing SSO."
