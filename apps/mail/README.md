# Darevel Mail Application

Modern, professional email client with integrated calendar, meeting scheduling, and video conferencing capabilities.

## Features

### ✉️ Email Management
- **Modern Interface**: Clean, intuitive UI with dark mode support
- **Folder Organization**: Inbox, Sent, Starred, Drafts, Trash
- **Email Threading**: Group related emails together
- **Rich Compose**: Full-featured email composition with attachments
- **Search**: Fast email search across all folders
- **Star Important Emails**: Quick access to starred messages

### 📅 Calendar & Scheduling
- **Integrated Calendar**: View and manage your schedule
- **Meeting Scheduler**: Create and schedule meetings with attendees
- **Video Conferencing**: Integration with Jitsi for video calls
- **Meeting Links**: Auto-generate meeting links
- **Calendar Events**: Track appointments and reminders

### 🎨 Modern UI
- **Top Navigation Bar**: Logo, search, notifications, settings
- **Left Sidebar**: Quick folder access with visual icons
- **Responsive Design**: Works on all screen sizes
- **Dark Mode**: Eye-friendly dark theme
- **Badge Notifications**: Unread email count badges

### 🔐 Security
- **Keycloak SSO**: Integrated authentication
- **Token Management**: Automatic token refresh
- **Secure API**: Bearer token authorization

## Technology Stack

- **React 19.2.0**: Modern React with hooks
- **TypeScript 5.8.2**: Type-safe development
- **Vite 6.2.0**: Fast build tool and dev server
- **Keycloak-js 22.0.5**: SSO authentication
- **Axios 1.13.1**: HTTP client for API calls
- **Lucide React**: Beautiful icon library
- **Tailwind CSS**: Utility-first styling

## Architecture

```
mail/
├── App.tsx                    # Main application component
├── index.tsx                  # Entry point with Keycloak
├── index.html                 # HTML template
├── types.ts                   # TypeScript interfaces
├── package.json               # Dependencies
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
└── src/
    └── services/
        └── api.ts            # API client with auth
```

## Development

### Prerequisites
- Node.js 18+ and npm
- Keycloak server running on `localhost:8080`
- Mail backend API running on `localhost:8083`

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Keycloak Client**
   - Realm: `darevel`
   - Client ID: `mail-client`
   - URL: `http://localhost:8080/`

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Application will run on `http://localhost:3008`

4. **Build for Production**
   ```bash
   npm run build
   ```

### Environment Configuration

The application connects to:
- **Frontend**: `http://localhost:3008`
- **Backend API**: `http://localhost:8083` (proxied via `/api`)
- **Keycloak**: `http://localhost:8080`

## API Integration

The mail app communicates with the backend API at `http://localhost:8083`. All API calls are:
- Proxied through Vite dev server (`/api` → backend)
- Authenticated with Keycloak bearer tokens
- Automatically refreshed on token expiration

### Available API Endpoints

#### Email Operations
- `GET /api/emails/folder/{folder}` - Get emails by folder
- `GET /api/emails/{id}` - Get email by ID
- `POST /api/emails/send` - Send new email
- `POST /api/emails/draft` - Save draft
- `DELETE /api/emails/{id}` - Delete email
- `PATCH /api/emails/{id}/read` - Mark as read/unread
- `PATCH /api/emails/{id}/star` - Star/unstar email
- `PATCH /api/emails/{id}/move` - Move to folder
- `GET /api/emails/search?q={query}` - Search emails

#### Meeting Operations
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create meeting
- `PUT /api/meetings/{id}` - Update meeting
- `DELETE /api/meetings/{id}` - Delete meeting
- `POST /api/meetings/generate-link` - Generate meeting link

#### Draft Operations
- `GET /api/emails/drafts` - Get all drafts
- `PUT /api/emails/draft/{id}` - Update draft
- `DELETE /api/emails/draft/{id}` - Delete draft

#### Attachment Operations
- `POST /api/attachments/upload` - Upload attachment
- `GET /api/attachments/{id}` - Download attachment

## Component Structure

### Main Components

#### App.tsx
- Main application container
- State management for emails, folders, view modes
- Dark mode toggle
- Navigation logic

#### Email Views
- **Email List**: Grid of email items with preview
- **Email Detail**: Full email view with actions
- **Compose**: Email composition form
- **Schedule Meeting**: Meeting creation form

#### Navigation
- **Left Sidebar**: Folder navigation with icons and badges
- **Top Header**: Search, notifications, settings, user profile

## Features in Detail

### Email Composition
- To/CC/BCC fields
- Subject line
- Rich text body
- Attachment support
- Draft auto-save
- Send with keyboard shortcut

### Meeting Scheduling
- Meeting title and description
- Start/end date & time
- Location field
- Auto-generate video link
- Attendee management
- Calendar integration
- Instant meeting option

### Email Management
- Mark as read/unread
- Star/unstar
- Delete (move to trash)
- Archive
- Reply/Forward
- Search across all folders
- Folder organization

## Keyboard Shortcuts

- `C` - Compose new email
- `R` - Reply to selected email
- `F` - Forward selected email
- `Delete` - Move to trash
- `S` - Star/unstar
- `/` - Focus search

## UI Components

### Sidebar Icons
- Inbox (with unread badge)
- Sent
- Starred
- Drafts
- Trash
- Schedule Meeting
- Calendar
- Video Call

### Action Buttons
- Compose (primary CTA)
- Refresh
- Filter
- More options
- Reply/Forward
- Archive/Delete

## Styling

The application uses:
- **Tailwind CSS**: Utility classes via CDN
- **Dark Mode**: `dark:` variants for all colors
- **Custom Colors**: Blue primary, slate neutrals
- **Responsive**: Mobile-first design
- **Animations**: Smooth transitions on hover/active states

## Authentication Flow

1. App loads `index.tsx`
2. Keycloak initializes with `login-required`
3. User redirected to Keycloak login if not authenticated
4. Token obtained and stored
5. Token refreshed every 60 seconds
6. App renders after successful authentication
7. API calls include bearer token in headers

## Data Models

### Email
```typescript
interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string[];
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  folder: FolderType;
  hasAttachment?: boolean;
}
```

### Meeting
```typescript
interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  attendees: string[];
  organizer: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}
```

## Migration from Legacy UI

The previous mail UI has been backed up to:
```
backup-legacy-2025-11-28/
```

Key improvements in new UI:
✅ Modern design with top navigation and sidebar
✅ Better folder organization with visual icons
✅ Improved email list with card-based design
✅ Integrated meeting scheduler
✅ Dark mode support
✅ Responsive layout
✅ Better authentication flow
✅ Cleaner API client with TypeScript types

## Troubleshooting

### Authentication Issues
- Ensure Keycloak is running on `localhost:8080`
- Verify client ID is `mail-client` in Keycloak
- Check browser console for token errors

### API Connection Issues
- Verify backend is running on `localhost:8083`
- Check proxy configuration in `vite.config.ts`
- Inspect network tab for failed requests

### UI Issues
- Clear browser cache
- Rebuild with `npm run build`
- Check for TypeScript errors with `npm run lint`

## Future Enhancements

- [ ] Email templates
- [ ] Advanced search filters
- [ ] Labels and tags
- [ ] Email rules and automation
- [ ] Offline support
- [ ] Desktop notifications
- [ ] Email signatures
- [ ] Conversation view
- [ ] Quick replies
- [ ] Smart compose with AI

## License

MIT License - Part of Darevel Suite

## Support

For issues or questions, please contact the Darevel development team.
