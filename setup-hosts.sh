#!/bin/bash
# Shell script to configure hosts file for Darevel Suite
# Run with: sudo ./setup-hosts.sh

echo "========================================"
echo "Darevel Suite - Hosts File Setup"
echo "========================================"
echo ""

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then
    echo "ERROR: This script must be run with sudo!"
    echo ""
    echo "Please run: sudo ./setup-hosts.sh"
    echo ""
    exit 1
fi

HOSTS_PATH="/etc/hosts"
BACKUP_PATH="/etc/hosts.backup.$(date +%Y%m%d-%H%M%S)"

echo "Creating backup of hosts file..."
cp "$HOSTS_PATH" "$BACKUP_PATH"
echo "Backup created: $BACKUP_PATH"
echo ""

# Darevel domains to add
DOMAINS=(
    "suite.darevel.local"
    "auth.darevel.local"
    "mail.darevel.local"
    "chat.darevel.local"
    "excel.darevel.local"
    "slides.darevel.local"
    "drive.darevel.local"
    "notify.darevel.local"
)

echo "Checking existing hosts file..."

# Check if Darevel entries already exist
if grep -q "darevel.local" "$HOSTS_PATH"; then
    echo ""
    echo "Found existing Darevel entries:"
    grep "darevel.local" "$HOSTS_PATH" | sed 's/^/  /'
    echo ""
    read -p "Do you want to overwrite them? (y/n): " overwrite

    if [ "$overwrite" != "y" ]; then
        echo "Setup cancelled."
        exit 0
    fi

    # Remove existing Darevel entries
    echo "Removing existing Darevel entries..."
    sed -i.tmp '/darevel.local/d' "$HOSTS_PATH"
    rm -f "$HOSTS_PATH.tmp"
fi

echo ""
echo "Adding Darevel Suite domains..."
echo ""

# Add header comment and entries
{
    echo ""
    echo "# Darevel Suite - Local Development"
    echo "# Added on $(date '+%Y-%m-%d %H:%M:%S')"
    for domain in "${DOMAINS[@]}"; do
        echo "127.0.0.1 $domain"
    done
} >> "$HOSTS_PATH"

# Display added entries
for domain in "${DOMAINS[@]}"; do
    echo "  + 127.0.0.1 $domain"
done

echo ""
echo "Flushing DNS cache..."

# Flush DNS based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    dscacheutil -flushcache
    killall -HUP mDNSResponder
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v systemd-resolve &> /dev/null; then
        systemd-resolve --flush-caches
    elif command -v nscd &> /dev/null; then
        nscd -i hosts
    fi
fi

echo ""
echo "========================================"
echo "SUCCESS! Hosts file configured."
echo "========================================"
echo ""

echo "Testing DNS resolution..."
echo ""

for domain in "${DOMAINS[@]}"; do
    if ping -c 1 -W 1 "$domain" &> /dev/null; then
        echo "  ✓ OK  $domain"
    else
        echo "  ✗ FAIL $domain"
    fi
done

echo ""
echo "Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Visit: http://suite.darevel.local:3000"
echo "3. You'll be redirected to: http://auth.darevel.local:3005/signin"
echo "4. Login with: demo@darevel.com / demo123"
echo ""
echo "All Darevel apps:"
echo "  Suite:  http://suite.darevel.local:3000"
echo "  Auth:   http://auth.darevel.local:3005"
echo "  Mail:   http://mail.darevel.local:3003"
echo "  Chat:   http://chat.darevel.local:3002"
echo "  Excel:  http://excel.darevel.local:3004"
echo "  Slides: http://slides.darevel.local:3001"
echo "  Drive:  http://drive.darevel.local:3006"
echo "  Notify: http://notify.darevel.local:3007"
echo ""
