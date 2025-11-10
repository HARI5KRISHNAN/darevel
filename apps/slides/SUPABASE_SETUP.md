# Supabase Setup Instructions for Phase 5

## Overview

Phase 5 adds cloud storage and collaboration features using Supabase as the backend.

## Prerequisites

1. A Supabase account (free tier works great)
2. Node.js installed

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - Name: `powerpoint-app` (or your choice)
   - Database Password: Choose a strong password
   - Region: Select closest to you
4. Wait for project to be created (~2 minutes)

## Step 2: Get API Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon)
2. Go to **API** section
3. Copy the following values:
   - **Project URL** (starts with `https://...supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 3: Update Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholders:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL Editor
5. Click **"Run"** or press `Ctrl/Cmd + Enter`
6. Verify success (should see "Success. No rows returned")

## Step 5: Configure Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. **Email** provider should be enabled by default
3. Configure email templates if desired

### Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Follow instructions to:
   - Create Google OAuth credentials
   - Add redirect URLs
   - Enter Client ID and Secret

## Step 6: Test the Application

### Start Development Server

```bash
npm run dev
```

### Test Authentication Flow

1. Go to `http://localhost:3000/signup`
2. Create an account with email/password
3. You should be redirected to the dashboard
4. Try creating a presentation

### Verify Database

1. Go back to Supabase dashboard
2. Navigate to **Table Editor**
3. Check `presentations` table - you should see your test presentation

## Features Implemented

### ✅ Cloud Storage
- All presentations saved to Supabase PostgreSQL
- User-specific storage with Row Level Security
- Auto-sync on save

### ✅ Authentication
- Email/password signup and login
- Google OAuth support
- Secure session management
- Protected routes

### ✅ Dashboard
- View all your presentations
- Create new presentations
- Delete presentations
- See last modified dates

### ✅ Database Schema
- **presentations** table - Stores all presentation data
- **collaboration_sessions** table - Ready for real-time collaboration
- Row Level Security policies for data protection

## Real-time Collaboration (Coming Next)

The database schema includes `collaboration_sessions` table for:
- Multi-user editing
- Cursor position tracking
- Presence indicators
- Real-time slide updates

To be implemented:
- WebSocket connections via Supabase Realtime
- Multi-cursor visualization
- Live collaborator list

## Troubleshooting

### "Invalid API key" error
- Double-check `.env.local` has correct values
- Restart dev server after changing env variables

### "Relation 'presentations' does not exist"
- Make sure you ran the SQL schema in Supabase
- Check the SQL ran without errors

### Redirect loops on login
- Clear browser cookies and cache
- Check middleware is properly configured

### Can't create presentations
- Verify user is authenticated (check browser dev tools console)
- Check RLS policies are in place (run schema again if needed)

## API Routes Structure

```
/api/presentations
├── GET     - List user's presentations
├── POST    - Create new presentation
├── [id]
│   ├── GET    - Get specific presentation
│   ├── PUT    - Update presentation
│   └── DELETE - Delete presentation
```

## Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Authenticated requests** - All API calls require valid session
- **Secure password hashing** - Handled by Supabase Auth
- **HTTPS only** - Enforced in production

## Next Steps

1. Implement real-time collaboration hooks
2. Add multi-cursor tracking
3. Add sharing features (is_public, shared_with)
4. Add collaboration UI indicators
5. Add presence system
