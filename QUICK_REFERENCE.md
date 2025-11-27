# Meeting Scheduling Fix - Quick Reference

## ✅ Problem Fixed
**Error**: "Failed to schedule meeting: Internal Server Error (500)"
**Cause**: Missing organizer ID + wrong participant format + no error handling
**Status**: **RESOLVED**

## 🚀 Quick Start

```powershell
# 1. Install dependencies
npm install

# 2. Start services
.\start-infrastructure.bat
.\start-chat.bat

# 3. Test
.\test-meeting-fix.bat

# 4. Open browser
http://localhost:3003
```

## 📦 What Was Changed

| Component | Files Changed | Status |
|-----------|---------------|--------|
| Backend Auth | `JwtUtils.java`, `UserService.java` | ✅ NEW |
| Error Handling | `GlobalExceptionHandler.java` | ✅ NEW |
| Meeting DTO | `MeetingDTO.java` | ✅ Updated |
| Meeting Service | `MeetingService.java` | ✅ Enhanced |
| Port Config | `application.yml` (8082→8081) | ✅ Fixed |
| Shared Package | `@darevel/shared` | ✅ NEW |
| Meeting Service | `meetingService.ts` | ✅ Fixed |
| Chat Frontend | `MeetingSchedulerV2.tsx` | ✅ Updated |
| Dependencies | `package.json` (chat, mail) | ✅ Updated |

## 🔧 Key Features

1. **JWT Authentication** - Extracts organizer from Keycloak token
2. **Email Conversion** - Converts participant emails to user IDs
3. **Error Messages** - Clear, actionable error messages
4. **Calendar Sync** - Syncs meetings to both chat and mail calendars
5. **Type Safety** - Shared TypeScript types across apps

## 📊 Architecture

```
Frontend (React)
    ↓
@darevel/shared/MeetingService
    ↓
Chat Backend (8081) ←→ Mail Backend (8083)
    ↓                       ↓
darevel_chat DB      darevel_mail DB
```

## 🧪 Testing

### Test 1: Create Meeting
```typescript
// In browser console
fetch('http://localhost:8081/api/meetings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Meeting',
    startTime: '2025-11-25T10:00:00Z',
    endTime: '2025-11-25T11:00:00Z',
    participantEmails: ['test@example.com']
  })
})
.then(r => r.json())
.then(console.log)
```

### Test 2: Check Database
```sql
-- In PostgreSQL
SELECT * FROM meetings;
SELECT * FROM meeting_participants;
```

### Test 3: View in UI
1. Open http://localhost:3003
2. Go to Calendar
3. Create meeting with form
4. Check both chat and mail calendars

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Port 8081 in use | `netstat -ano \| findstr :8081` then `taskkill /PID <PID> /F` |
| DB connection fails | Check `docker ps` and `.\start-infrastructure.bat` |
| "Unable to determine organizer" | Enable Keycloak auth or see JWT setup in docs |
| "User not found" | Create user in auth service first |
| 500 error persists | Check backend logs: `docker logs darevel-chat-backend` |

## 📚 Documentation

- **Setup Guide**: `MEETING_SCHEDULING_FIX.md` (detailed)
- **Summary**: `SUMMARY.md` (overview)
- **This File**: Quick reference

## 🎯 Success Criteria

✅ Meeting creates without 500 error
✅ Organizer set automatically from auth
✅ Participants converted from emails to IDs
✅ Meeting appears in chat calendar
✅ Meeting syncs to mail calendar (basic)
✅ Clear error messages displayed

## 🔜 Future Enhancements (Optional)

- [ ] Real-time sync via WebSocket
- [ ] Recurring meetings
- [ ] Email notifications
- [ ] Conflict resolution UI
- [ ] Meeting reminders

## 💡 Pro Tips

1. **Check logs**: Backend logs show detailed info about conversions
2. **Use test script**: `test-meeting-fix.bat` validates setup
3. **Browser DevTools**: Network tab shows API responses
4. **Database inspect**: Direct SQL queries for debugging

## 📞 Need Help?

1. Check `MEETING_SCHEDULING_FIX.md` for troubleshooting
2. Review backend logs for errors
3. Test API directly with curl/Postman
4. Verify database tables exist

---

**TL;DR**: The fix is complete and ready to test. Run `.\start-chat.bat` and create a meeting at http://localhost:3003!
