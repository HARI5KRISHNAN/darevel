# Keycloak Configuration Files

This directory contains Keycloak realm configuration files that are automatically imported when Docker starts.

## Files

### realm-export.json

Complete configuration for the **pilot180** realm including:
- 6 pre-configured OAuth clients (one for each Darevel app)
- 2 test users (demo & admin)
- Realm settings and security policies

## Auto-Import

When you run `npm run dev`, this file is automatically imported into Keycloak via Docker volume mount.

## Clients Configured

| Client ID | App | Port |
|-----------|-----|------|
| darevel-suite | Suite Dashboard | 3000 |
| darevel-slides | Presentation App | 3001 |
| darevel-chat | AI Chat | 3002 |
| ai-email-assistant | Mail Client | 3003 |
| darevel-excel | Spreadsheet App | 3004 |
| darevel-drive | Cloud Storage | 3006 |

## Test Users

**Demo User:**
- Email: demo@darevel.com
- Password: demo123
- Role: user

**Admin User:**
- Email: admin@darevel.com
- Password: admin123
- Roles: user, admin

## Modifying Configuration

1. Edit `realm-export.json`
2. Clean existing data: `npm run clean`
3. Restart: `npm run dev`

⚠️ **Warning:** This will delete all Keycloak data!

## Documentation

See [../KEYCLOAK_SETUP.md](../KEYCLOAK_SETUP.md) for complete documentation.
