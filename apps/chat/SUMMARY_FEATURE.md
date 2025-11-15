# AI Summary with Export Features

## Overview
The Message Summary Generator allows users to generate AI-powered summaries of chat conversations with advanced export options.

## Features

### 1. Message Selection
- **Select All/Deselect All**: Quickly toggle selection of all messages
- **Individual Selection**: Choose specific messages using checkboxes
- **Date Filtering**: Filter messages by date using the date picker

### 2. AI Summary Generation
- Powered by Gemini 2.5 Flash (fast and cost-effective)
- Generates concise bullet-point summaries
- Highlights key decisions and action items
- Real-time generation with loading states

### 3. Export Options

#### Copy to Clipboard
- One-click copy functionality
- Instant confirmation feedback
- Works on all modern browsers

#### Download as PDF
- Professional PDF format
- Includes title and timestamp
- Formatted for readability
- Automatic filename generation

## How to Use

### Access the Summary View
1. Open any conversation in the Messages view
2. Click the "AI Summary" button in the top header (sparkles icon)
3. A modal will open with the summary generator

### Generate a Summary
1. **Optional**: Select a specific date to filter messages
2. **Optional**: Choose specific messages using checkboxes
3. Click "✨ Generate AI Summary"
4. Wait for the AI to process (usually 2-5 seconds)

### Export the Summary
Once generated, you can:
1. **Copy to Clipboard**: Click "📋 Copy to Clipboard"
2. **Download PDF**: Click "📄 Download PDF"

## Technical Details

### Components
- `MessagesSummaryView.tsx`: Main summary UI component
- `ConversationView.tsx`: Integration point with modal
- `MessagesView.tsx`: Parent component with conversation state

### Dependencies
- `jspdf`: PDF generation
- `react-datepicker`: Date selection UI
- `@google/generative-ai`: Gemini AI integration

### API Integration
The summary feature uses the secure backend endpoint:
```
POST /api/ai/summary
```

All API keys are securely stored server-side. The frontend never has access to the Gemini API key.

## Security Features
- ✅ API key stored in backend only
- ✅ No secrets exposed to browser
- ✅ Secure proxy pattern
- ✅ Environment variable protection
- ✅ User-friendly error messages

## Customization

### Change AI Model
Edit `backend/src/controllers/ai.controller.ts`:
```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' }); // More capable
// or
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Faster
```

### Customize PDF Format
Edit `components/MessagesSummaryView.tsx` in the `handleDownloadPDF` function to adjust:
- Font sizes
- Layout
- Header/footer content
- Styling

### Adjust Summary Prompt
Edit `backend/src/controllers/ai.controller.ts`:
```typescript
const prompt = `Your custom prompt here...`;
```

## Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Known Limitations
- PDF generation is client-side (limited formatting options)
- Date picker requires JavaScript enabled
- Clipboard API requires HTTPS (except localhost)

## Future Enhancements
- Export to Word/Markdown
- Email summary directly
- Schedule automatic summaries
- Summary templates
- Multi-language support
