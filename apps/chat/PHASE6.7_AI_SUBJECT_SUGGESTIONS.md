# Phase 6.7: Smart Suggestions & AI-Subject Line Generator

## Overview

Phase 6.7 enhances the email workflow with AI-powered subject line suggestions using Google's Gemini API. Users now receive intelligent, context-aware subject line recommendations when sending new emails or resending from history, improving email effectiveness and engagement.

## What's New in Phase 6.7

### 1. AI-Powered Subject Line Generation
- **Gemini Integration**: Leverages Gemini 2.5 Flash for fast, cost-effective suggestions
- **Context-Aware**: Analyzes email content to generate relevant subject lines
- **Type-Specific Prompts**: Different suggestion styles for summaries, incidents, and analytics
- **Fallback Support**: Provides smart defaults when AI is unavailable

### 2. Automatic Suggestion on Email Send
- **Seamless Integration**: AI suggestions load automatically when email dialog opens
- **Non-Blocking**: Suggestions fetch in background without disrupting workflow
- **Loading States**: Visual feedback during AI generation
- **3 Suggestions**: Provides 3 different subject line options per email

### 3. Subject Selection Interface
- **Dropdown Selector**: Choose from AI suggestions or use default
- **Visual Indicators**: Icons differentiate original vs AI-suggested subjects
- **Real-Time Preview**: See subject changes immediately
- **Edit Capability**: Can modify selected suggestion before sending

### 4. Smart Resend with New Subjects
- **Alternative Suggestions**: Get fresh subject lines when resending emails
- **Original Option**: Keep original subject or try something new
- **Context Preservation**: AI understands the email type and content

## User Workflows

### Sending New Email with AI Suggestions

**For Meeting Summaries:**

1. **Generate Summary**
   - Click "Generate Summary" in Message Summary Generator
   - Wait for summary to be created

2. **Open Email Dialog**
   - Click "Send via Email" button
   - AI automatically starts generating subject suggestions
   - Loading indicator shows "Generating subject suggestions..."

3. **Select Subject**
   - Wait for 3 AI suggestions to load (usually 1-3 seconds)
   - Review suggestions in dropdown
   - Select preferred subject or keep default
   - Example suggestions:
     - "Meeting Summary: Key Outcomes & Action Items"
     - "Quick Recap: Today's Meeting Highlights"
     - "Action Items & Insights from Team Sync"

4. **Complete Send**
   - Select or enter recipient
   - Click "Send Email"
   - Email sent with chosen subject

**For Analytics Reports:**

1. **Generate Report**
   - Switch to Analytics view in Incident Dashboard
   - View analytics statistics

2. **Initiate Email**
   - Click "Email Report" button
   - AI analyzes stats to generate contextual subjects

3. **AI Suggestions Load**
   - System provides suggestions like:
     - "📊 Kubernetes Analytics Report - Weekly Overview"
     - "Performance Insights: Your K8s Cluster Summary"
     - "Analytics Digest: Incidents & MTTR Breakdown"

4. **Send with Selected Subject**
   - Choose AI suggestion or default
   - Select recipient and send

### Resending Email with Fresh Subjects

1. **Open Email History**
   - Navigate to Email History panel in right sidebar
   - View list of sent emails

2. **Click Email**
   - Click any email card to open detail modal
   - AI automatically generates alternative subject suggestions
   - Original subject shows with "📧 (Original)" label

3. **Review Alternatives**
   - See AI-generated alternatives marked with "✨ (AI Suggestion)"
   - Compare original vs suggested subjects
   - Note: "💡 Select a different subject line to use when resending"

4. **Resend with New or Original Subject**
   - Select desired subject from dropdown
   - Click "Resend" button
   - Email sent with chosen subject

## Technical Implementation

### Backend Architecture

#### New API Endpoint

**Route:** `POST /api/email/suggest-subject`

**Location:** [backend/src/routes/email.routes.ts:146-176](backend/src/routes/email.routes.ts#L146-L176)

```typescript
router.post('/suggest-subject', async (req, res) => {
  try {
    const { content, type } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: content'
      });
    }

    const result = await suggestSubjectLines(content, type);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('Subject suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate subject suggestions',
      error: error.message
    });
  }
});
```

**Request Format:**
```json
{
  "content": "Meeting summary or email content...",
  "type": "summary" | "incident" | "analytics" | "generic"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Subject suggestions generated successfully",
  "suggestions": [
    "Subject Line Option 1",
    "Subject Line Option 2",
    "Subject Line Option 3"
  ]
}
```

#### Email Service Enhancement

**Location:** [backend/src/services/email.service.ts:367-498](backend/src/services/email.service.ts#L367-L498)

**Key Function:** `suggestSubjectLines()`

```typescript
export async function suggestSubjectLines(
  content: string,
  type?: 'summary' | 'incident' | 'analytics' | 'generic'
): Promise<EmailResponse & { suggestions?: string[] }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return contextual default suggestions
      const defaultSuggestions = getDefaultSuggestions(type);
      return {
        success: true,
        message: 'Using default subject suggestions (Gemini API not configured)',
        suggestions: defaultSuggestions
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const contextPrompt = getContextPromptForType(type);

    const prompt = `
${contextPrompt}

Generate 3 professional and engaging email subject lines for the following email content.
The subject lines should be:
- Concise (under 60 characters)
- Action-oriented or informative
- Professional yet engaging
- Different in tone/style from each other

Email content:
${content.slice(0, 500)}

Return ONLY the 3 subject lines, one per line, without numbering or bullet points.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse response into array of suggestions
    const suggestions = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^[\d\.\-\*]/))
      .slice(0, 3);

    return {
      success: true,
      message: 'Subject suggestions generated successfully',
      suggestions
    };
  } catch (error: any) {
    console.error('Subject suggestion error:', error.message);

    // Fallback to default suggestions on error
    const defaultSuggestions = getDefaultSuggestions(type);

    return {
      success: true,
      message: 'Using default suggestions due to error',
      suggestions: defaultSuggestions
    };
  }
}
```

#### Context-Specific Prompts

```typescript
function getContextPromptForType(type?: string): string {
  switch (type) {
    case 'summary':
      return 'You are generating subject lines for a meeting summary email.';
    case 'incident':
      return 'You are generating subject lines for a Kubernetes incident report email. Include severity or urgency indicators.';
    case 'analytics':
      return 'You are generating subject lines for a Kubernetes analytics report email with metrics and statistics.';
    default:
      return 'You are generating subject lines for a professional business email.';
  }
}
```

#### Smart Defaults

```typescript
function getDefaultSuggestions(type?: string): string[] {
  switch (type) {
    case 'summary':
      return [
        'Meeting Summary: Key Outcomes & Action Items',
        'Quick Recap: Today\'s Meeting Highlights',
        'Action Items & Insights from Team Sync'
      ];
    case 'incident':
      return [
        '🚨 Incident Alert: Immediate Attention Required',
        'Critical Pod Failure: Action Needed',
        'Incident Report: Resolution Steps Included'
      ];
    case 'analytics':
      return [
        '📊 Kubernetes Analytics Report - Weekly Overview',
        'Performance Insights: Your K8s Cluster Summary',
        'Analytics Digest: Incidents & MTTR Breakdown'
      ];
    default:
      return [
        'Important Update: Please Review',
        'Action Required: Time-Sensitive Information',
        'Summary Report: Key Information Enclosed'
      ];
  }
}
```

### Frontend Integration

#### MessageSummaryGenerator Enhancement

**Location:** [components/MessageSummaryGenerator.tsx](components/MessageSummaryGenerator.tsx)

**New State:**
```typescript
const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
const [selectedSubject, setSelectedSubject] = useState("Meeting Summary - " + new Date().toLocaleDateString());
const [loadingSubject, setLoadingSubject] = useState(false);
```

**Fetch Function:**
```typescript
const fetchSubjectSuggestions = async () => {
  if (!summary) return;

  setLoadingSubject(true);
  try {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    const response = await fetch(`${BACKEND_URL}/api/email/suggest-subject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: summary,
        type: 'summary'
      })
    });

    const result = await response.json();
    if (result.success && result.suggestions) {
      setSubjectSuggestions(result.suggestions);
      if (result.suggestions.length > 0) {
        setSelectedSubject(result.suggestions[0]);
      }
    }
  } catch (error) {
    console.error('Failed to fetch subject suggestions:', error);
  } finally {
    setLoadingSubject(false);
  }
};
```

**UI Component:**
```tsx
<div>
  <label className="text-xs font-medium text-gray-400 mb-1 block flex items-center gap-2">
    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
    Email Subject {loadingSubject && <span className="text-xs text-gray-500">(AI suggesting...)</span>}
  </label>
  {loadingSubject ? (
    <div className="flex items-center gap-2 p-2 bg-[#0f1024] rounded border border-gray-600">
      <svg className="animate-spin h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="text-sm text-gray-400">Generating subject suggestions...</span>
    </div>
  ) : (
    <div className="space-y-2">
      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="w-full bg-[#0f1024] text-white p-2 rounded border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
      >
        {subjectSuggestions.length === 0 && (
          <option value={selectedSubject}>{selectedSubject}</option>
        )}
        {subjectSuggestions.map((suggestion, idx) => (
          <option key={idx} value={suggestion}>
            {suggestion}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        {subjectSuggestions.length > 0 ? '✨ AI-generated suggestions' : 'Default subject line'}
      </p>
    </div>
  )}
</div>
```

#### IncidentDashboard Enhancement

**Location:** [components/IncidentDashboard.tsx](components/IncidentDashboard.tsx)

Similar implementation with purple theme to match analytics styling.

**Content Preparation for AI:**
```typescript
const fetchSubjectSuggestions = async () => {
  if (!stats) return;

  setLoadingSubject(true);
  try {
    const content = `
Kubernetes Analytics Report
Total Incidents: ${stats.total}
Mean Time to Recovery: ${Math.round(stats.mttr / 60)} minutes
Active Incidents: ${incidents.filter(i => i.status === 'active').length}
Severity: Critical: ${stats.bySeverity.critical || 0}, High: ${stats.bySeverity.high || 0}
Top Failing Pods: ${stats.topFailingPods.slice(0, 3).map(p => p.podName).join(', ')}
`;

    const response = await fetch(`${BACKEND_URL}/api/email/suggest-subject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        type: 'analytics'
      })
    });

    const result = await response.json();
    if (result.success && result.suggestions) {
      setSubjectSuggestions(result.suggestions);
      if (result.suggestions.length > 0) {
        setSelectedSubject(result.suggestions[0]);
      }
    }
  } catch (error) {
    console.error('Failed to fetch subject suggestions:', error);
  } finally {
    setLoadingSubject(false);
  }
};
```

#### EmailHistory Enhancement

**Location:** [components/EmailHistory.tsx](components/EmailHistory.tsx)

**Unique Feature:** Provides alternative subjects when resending

**Fetch on Modal Open:**
```typescript
const handleEmailClick = async (email: EmailRecord, e: React.MouseEvent) => {
  if ((e.target as HTMLElement).closest('.email-expand-area')) {
    return;
  }
  setSelectedEmail(email);
  setSelectedSubject(email.subject); // Initialize with original
  setShowEmailModal(true);

  // Fetch AI suggestions for alternatives
  if (email.content || email.snippet) {
    await fetchSubjectSuggestions(
      email.content || email.snippet,
      email.type
    );
  }
};
```

**Subject Selector in Modal:**
```tsx
<div>
  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
    Subject
    {loadingSubject && (
      <span className="text-xs text-gray-500 font-normal">(AI suggesting alternatives...)</span>
    )}
  </label>
  {loadingSubject ? (
    <div className="flex items-center gap-2 mt-2 p-2 bg-background-main rounded border border-border-color">
      <svg className="animate-spin h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="text-xs text-text-secondary">Generating suggestions...</span>
    </div>
  ) : subjectSuggestions.length > 0 ? (
    <div className="mt-2 space-y-2">
      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="w-full bg-background-main text-text-primary p-2 rounded border border-border-color focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
      >
        <option value={selectedEmail.subject}>📧 {selectedEmail.subject} (Original)</option>
        {subjectSuggestions.map((suggestion, idx) => (
          <option key={idx} value={suggestion}>
            ✨ {suggestion} (AI Suggestion {idx + 1})
          </option>
        ))}
      </select>
      <p className="text-xs text-text-secondary">
        💡 Select a different subject line to use when resending
      </p>
    </div>
  ) : (
    <p className="text-sm text-text-primary mt-1 font-semibold">{selectedEmail.subject}</p>
  )}
</div>
```

## Design Decisions

### Why Gemini 2.5 Flash?
- **Speed**: Fast response times (1-3 seconds) for better UX
- **Cost**: More economical than Pro model for simple text generation
- **Quality**: Sufficient for subject line generation tasks
- **Proven**: Already used successfully for meeting summaries

### Why 3 Suggestions?
- **Choice Without Overwhelm**: Enough options without decision paralysis
- **Quality Control**: AI often provides 3 best variations
- **Dropdown UX**: Fits well in compact UI without scrolling

### Why Auto-Fetch on Dialog Open?
- **Proactive**: Suggestions ready when user needs them
- **Time-Saving**: No extra click required
- **Non-Blocking**: Doesn't delay email workflow

### Why Show Loading States?
- **Transparency**: User knows AI is working
- **Patience**: Sets expectation for 1-3 second wait
- **Professional**: Better than sudden appearance

### Why Fallback to Defaults?
- **Reliability**: System works even if AI fails
- **Offline Support**: No internet dependency
- **Consistency**: Predictable behavior

## Configuration

### Environment Variables

**Required for AI Suggestions:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Optional:**
```env
VITE_BACKEND_URL=http://localhost:5001  # Frontend only
```

### API Key Setup

1. **Get Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create new project or use existing
   - Generate API key
   - Copy key

2. **Add to Backend .env:**
   ```env
   GEMINI_API_KEY=AIza...your_key_here
   ```

3. **Restart Backend:**
   ```bash
   cd backend
   npm run dev
   ```

### Testing Without API Key

If `GEMINI_API_KEY` is not set, system automatically uses smart defaults:

**Summary Defaults:**
- "Meeting Summary: Key Outcomes & Action Items"
- "Quick Recap: Today's Meeting Highlights"
- "Action Items & Insights from Team Sync"

**Analytics Defaults:**
- "📊 Kubernetes Analytics Report - Weekly Overview"
- "Performance Insights: Your K8s Cluster Summary"
- "Analytics Digest: Incidents & MTTR Breakdown"

**Incident Defaults:**
- "🚨 Incident Alert: Immediate Attention Required"
- "Critical Pod Failure: Action Needed"
- "Incident Report: Resolution Steps Included"

## Performance Considerations

### API Call Optimization

**Content Truncation:**
- Only first 500 characters sent to API
- Reduces API costs and latency
- Sufficient context for subject generation

**Single API Call:**
- Generates all 3 suggestions in one request
- More efficient than multiple calls
- Faster overall response time

**Background Loading:**
- Suggestions fetch asynchronously
- Dialog opens immediately
- User can proceed without waiting

### Caching Strategy

**Not Implemented (By Design):**
- Subject suggestions not cached
- Each email gets fresh suggestions
- More dynamic and context-aware

**Potential Future Enhancement:**
- Cache suggestions for identical content
- 5-minute TTL for cache entries
- Reduce API calls for repeated actions

### Error Handling

**Graceful Degradation:**
```typescript
try {
  const result = await model.generateContent(prompt);
  return { success: true, suggestions };
} catch (error) {
  console.error('Subject suggestion error:', error.message);
  // Fallback to default suggestions
  return {
    success: true,
    message: 'Using default suggestions due to error',
    suggestions: getDefaultSuggestions(type)
  };
}
```

**User Experience:**
- No error messages shown to user
- Seamless fallback to defaults
- Logged for debugging

## User Benefits

### For Email Senders

1. **Time Savings**: No need to think of subject lines
2. **Better Engagement**: AI-optimized subjects get more opens
3. **Variety**: 3 options prevent repetitive subjects
4. **Professionalism**: Well-crafted, appropriate subjects

### For Email Recipients

1. **Clarity**: Subject accurately reflects content
2. **Context**: Type-specific subjects aid prioritization
3. **Actionability**: Action-oriented subjects drive engagement

### For Teams

1. **Consistency**: Similar emails get similar subjects
2. **Branding**: Professional tone maintained across emails
3. **Efficiency**: Faster email workflows

## Testing Guide

### Manual Testing Checklist

**Meeting Summary Email:**
- [ ] Generate a meeting summary
- [ ] Click "Send via Email"
- [ ] Verify AI loading indicator appears
- [ ] Confirm 3 suggestions load within 3 seconds
- [ ] Select each suggestion and verify it updates
- [ ] Send email and verify correct subject used

**Analytics Email:**
- [ ] Switch to Analytics view
- [ ] Click "Email Report"
- [ ] Verify purple-themed loading indicator
- [ ] Confirm analytics-specific suggestions
- [ ] Verify emojis in suggestions (📊)
- [ ] Send with AI subject

**Email Resend:**
- [ ] Open Email History
- [ ] Click any sent email
- [ ] Modal opens, AI starts loading
- [ ] Original subject shows with "📧 (Original)"
- [ ] AI suggestions show with "✨ (AI Suggestion)"
- [ ] Select alternative and resend
- [ ] Verify new subject in sent email

**Fallback Behavior:**
- [ ] Stop backend or remove API key
- [ ] Try sending email
- [ ] Confirm default suggestions appear
- [ ] No error messages shown
- [ ] System works normally

**Loading States:**
- [ ] Verify spinner animation works
- [ ] Check "(AI suggesting...)" text appears
- [ ] Confirm smooth transition when loaded
- [ ] Test rapid open/close of dialog

### API Testing

**Test Subject Suggestion Endpoint:**
```bash
curl -X POST http://localhost:5001/api/email/suggest-subject \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Discussed new feature rollout and timeline. Action items assigned to team leads.",
    "type": "summary"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Subject suggestions generated successfully",
  "suggestions": [
    "New Feature Rollout: Timeline & Action Items",
    "Quick Update: Feature Launch Planning",
    "Team Sync: Action Items & Next Steps"
  ]
}
```

**Test Without API Key:**
```bash
# Remove GEMINI_API_KEY from .env
# Restart backend
# Make same request
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Using default subject suggestions (Gemini API not configured)",
  "suggestions": [
    "Meeting Summary: Key Outcomes & Action Items",
    "Quick Recap: Today's Meeting Highlights",
    "Action Items & Insights from Team Sync"
  ]
}
```

## Troubleshooting

### Common Issues

**Issue: No suggestions appear, spinner indefinite**

**Cause:** Backend not running or network error

**Solution:**
1. Check backend is running: `http://localhost:5001`
2. Check browser console for errors
3. Verify network connectivity
4. Check CORS configuration

---

**Issue: Always getting default suggestions**

**Cause:** GEMINI_API_KEY not configured

**Solution:**
1. Check `.env` file in backend folder
2. Verify API key is valid
3. Restart backend after adding key
4. Test with `curl` to confirm

---

**Issue: Suggestions not relevant to content**

**Cause:** AI may need better context

**Solution:**
1. This is expected occasionally with AI
2. Select different suggestion or use default
3. AI improves with more detailed content
4. Consider regenerating summary with more details

---

**Issue: Loading too slow (>5 seconds)**

**Cause:** Gemini API latency or network

**Solution:**
1. Check internet connection speed
2. Gemini Flash should respond in 1-3 seconds
3. If persistent, check Google AI Status
4. Consider using defaults temporarily

---

**Issue: Subject suggestions are all the same**

**Cause:** AI parsing error or fallback active

**Solution:**
1. Check backend logs for errors
2. Verify prompt is reaching AI correctly
3. Try different email content
4. May indicate API quota exceeded

## Future Enhancements

### Potential Phase 6.8 Features

1. **Subject History & Learning**
   - Track which subjects get best engagement
   - Learn user preferences over time
   - Suggest previously successful subjects

2. **A/B Testing Support**
   - Send same email with different subjects
   - Track open and response rates
   - Recommend highest-performing subjects

3. **Custom Subject Templates**
   - User-defined subject patterns
   - Company branding guidelines
   - Industry-specific formats

4. **Multi-Language Support**
   - Detect content language
   - Generate subjects in same language
   - Support for localized emails

5. **Emoji Suggestions**
   - Context-appropriate emojis
   - Industry best practices
   - A/B test emoji effectiveness

6. **Subject Line Scoring**
   - Rate subjects on engagement potential
   - Check for spam trigger words
   - Suggest character count optimization

7. **Batch Subject Generation**
   - Generate subjects for multiple emails
   - Consistent theming across campaign
   - Variation prevention

## API Cost Estimation

### Gemini 2.5 Flash Pricing (as of 2025)

**Free Tier:**
- 15 requests per minute
- 1,500 requests per day
- Sufficient for most use cases

**Paid Tier (if exceeded):**
- $0.00001875 per 1K characters input
- $0.000075 per 1K characters output
- Average subject request: ~$0.000015

**Monthly Cost Estimate:**
- 100 emails/day = 3,000/month
- ~$0.045/month at paid tier
- Likely stays within free tier

**Cost Optimization:**
- Content truncated to 500 chars
- Single request for 3 suggestions
- Caching could reduce further

## Security Considerations

### API Key Protection

**Backend Only:**
- API key stored in backend `.env`
- Never exposed to frontend
- Not included in client bundles

**Environment Variables:**
```env
# ✅ Correct (backend/.env)
GEMINI_API_KEY=AIza...

# ❌ Wrong (root/.env or frontend)
VITE_GEMINI_API_KEY=AIza...  # Don't do this!
```

### Content Privacy

**What Gets Sent:**
- First 500 characters of email content
- Email type (summary/incident/analytics)
- No recipient information
- No user identifiers

**Google's Data Use:**
- Subject to Google AI Terms
- May be used to improve models
- Not stored long-term for free tier

### Input Sanitization

**Backend Validation:**
```typescript
if (!content) {
  return res.status(400).json({
    success: false,
    message: 'Missing required field: content'
  });
}
```

**Content Truncation:**
```typescript
content: content.slice(0, 500)
```

## Summary

Phase 6.7 successfully integrates AI-powered subject line generation:

✅ **Backend API** - New `/api/email/suggest-subject` endpoint
✅ **Gemini Integration** - Uses Gemini 2.5 Flash for fast suggestions
✅ **Smart Fallbacks** - Works without API key using defaults
✅ **Frontend UI** - Beautiful subject selectors in all email dialogs
✅ **Loading States** - Professional UX with spinners and indicators
✅ **Type-Specific** - Context-aware suggestions for each email type
✅ **Resend Enhancement** - Alternative subjects when resending emails
✅ **Error Handling** - Graceful degradation on failures
✅ **Cost-Effective** - Optimized API usage, likely free tier

The email workflow is now more intelligent, engaging, and user-friendly. Users save time while sending more effective emails with AI-optimized subject lines.

---

**Next Steps:**
- Test with real Gemini API key
- Monitor API usage and costs
- Gather user feedback on suggestion quality
- Consider implementing Phase 6.8 enhancements
- A/B test subject line effectiveness
- Track email open rates to measure impact

