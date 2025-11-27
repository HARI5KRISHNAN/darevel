#!/bin/bash
# Darevel Mail Server Setup Script
# This script initializes the mail server configuration

set -e

echo "==================================="
echo "Darevel Mail Server Setup"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running"

# Check if containers are running
echo ""
echo "Checking container status..."
if ! docker ps | grep -q "darevel-postfix"; then
    print_warning "Postfix container is not running. Starting mail server..."
    docker-compose up -d
    sleep 5
fi

if docker ps | grep -q "darevel-postfix"; then
    print_status "Postfix container is running"
else
    print_error "Failed to start Postfix container"
    exit 1
fi

if docker ps | grep -q "darevel-dovecot"; then
    print_status "Dovecot container is running"
else
    print_warning "Dovecot container is not running. Starting..."
    docker-compose up -d dovecot
    sleep 3
fi

# Initialize Postfix virtual mailboxes
echo ""
echo "Initializing Postfix virtual mailboxes..."
docker exec darevel-postfix postmap /etc/postfix/vmailbox
if [ $? -eq 0 ]; then
    print_status "Virtual mailbox database created"
else
    print_error "Failed to create virtual mailbox database"
    exit 1
fi

# Reload Postfix
docker exec darevel-postfix postfix reload > /dev/null 2>&1
print_status "Postfix configuration reloaded"

# Create mailbox directories
echo ""
echo "Creating mailbox directories..."
docker exec darevel-postfix sh -c "
    mkdir -p /var/mail/vhosts/darevel.local/alice &&
    mkdir -p /var/mail/vhosts/darevel.local/bob &&
    mkdir -p /var/mail/vhosts/darevel.local/charlie &&
    chown -R 1000:1000 /var/mail/vhosts &&
    chmod -R 755 /var/mail/vhosts
" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_status "Mailbox directories created with correct permissions"
else
    print_error "Failed to create mailbox directories"
    exit 1
fi

# Verify configuration
echo ""
echo "Verifying configuration..."

# Check virtual mailbox domains
VIRT_DOMAINS=$(docker exec darevel-postfix postconf -h virtual_mailbox_domains)
if echo "$VIRT_DOMAINS" | grep -q "darevel.local"; then
    print_status "Virtual mailbox domains configured: $VIRT_DOMAINS"
else
    print_warning "Virtual mailbox domains not configured correctly"
fi

# Check virtual mailbox maps
VIRT_MAPS=$(docker exec darevel-postfix postconf -h virtual_mailbox_maps)
if echo "$VIRT_MAPS" | grep -q "lmdb:/etc/postfix/vmailbox"; then
    print_status "Virtual mailbox maps configured: $VIRT_MAPS"
else
    print_warning "Virtual mailbox maps not configured correctly"
fi

# Check mailbox directories
MAILBOX_COUNT=$(docker exec darevel-postfix sh -c "ls -1 /var/mail/vhosts/darevel.local/ | wc -l")
if [ "$MAILBOX_COUNT" -ge 3 ]; then
    print_status "Found $MAILBOX_COUNT mailbox directories"
else
    print_warning "Expected 3 mailbox directories, found $MAILBOX_COUNT"
fi

# Test mail delivery
echo ""
echo "Testing mail delivery..."
docker exec darevel-postfix sh -c "
    echo 'Subject: Setup Test Email

This is an automated test email sent during setup.
If you see this, mail delivery is working correctly!' | sendmail bob@darevel.local
" > /dev/null 2>&1

sleep 2

# Check if email was delivered
if docker exec darevel-dovecot sh -c "ls /var/mail/vhosts/darevel.local/bob/new/ 2>/dev/null" | grep -q "."; then
    print_status "Test email delivered successfully"
else
    print_warning "Test email may not have been delivered (check logs)"
fi

# Display summary
echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Mail Server Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|postfix|dovecot"

echo ""
echo "Configuration Summary:"
echo "  - Domain: darevel.local"
echo "  - Users: alice, bob, charlie"
echo "  - SMTP Port: 25"
echo "  - IMAP Port: 143"
echo ""

echo "Quick Test Commands:"
echo "  View mail queue:  docker exec darevel-postfix mailq"
echo "  Check mailbox:    docker exec darevel-dovecot ls -la /var/mail/vhosts/darevel.local/bob/new/"
echo "  Watch logs:       docker logs -f darevel-postfix"
echo ""

echo "Send test email:"
echo "  docker exec darevel-postfix sh -c \"echo 'Subject: Test' | sendmail bob@darevel.local\""
echo ""

print_status "Setup completed successfully!"
