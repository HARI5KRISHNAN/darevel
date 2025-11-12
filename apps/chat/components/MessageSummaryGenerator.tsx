import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { addEmailRecord, getSuggestedRecipients } from "../utils/emailHistory";

interface Message {
  id: number;
  text: string;
  timestamp?: string;
}

interface MessageSummaryGeneratorProps {
  messages: Message[];
}

const MessageSummaryGenerator: React.FC<MessageSummaryGeneratorProps> = ({ messages }) => {
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [summary, setSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [customRecipient, setCustomRecipient] = useState("");
  const [suggestedRecipients, setSuggestedRecipients] = useState<string[]>([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("Meeting Summary - " + new Date().toLocaleDateString());
  const [loadingSubject, setLoadingSubject] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("latestMessageSummary");
    if (stored) setSummary(stored);

    // Load suggested recipients from history
    const suggested = getSuggestedRecipients();
    setSuggestedRecipients(suggested);
  }, []);

  const toggleSelect = (msgId: number) => {
    setSelectedMessages((prev) =>
      prev.includes(msgId)
        ? prev.filter((id) => id !== msgId)
        : [...prev, msgId]
    );
  };

  const generateSummary = async () => {
    if (selectedMessages.length === 0) {
      setShowDatePicker(true);
      return;
    }

    setIsGenerating(true);

    const selectedTexts = messages
      .filter((m) => selectedMessages.includes(m.id))
      .map((m) => m.text)
      .join("\n");

    try {
      // Try to use your existing Gemini API endpoint
      const response = await fetch("http://localhost:5001/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: selectedTexts }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiSummary = `🧠 AI Summary
────────────────────────────────
${data.summary}

────────────────────────────────
Generated on ${new Date().toLocaleString()}
Selected ${selectedMessages.length} message(s)`;

        setSummary(aiSummary);
        localStorage.setItem("latestMessageSummary", aiSummary);
      } else {
        throw new Error("API failed");
      }
    } catch (error) {
      // Fallback to mock summary
      const mockSummary = `🧠 Summary (Mock - API Unavailable)
────────────────────────────────
${selectedTexts.slice(0, 300)}...

Key Points:
• Discussion covered ${selectedMessages.length} messages
• Summary condensed from selected conversation
────────────────────────────────
Generated on ${new Date().toLocaleString()}`;

      setSummary(mockSummary);
      localStorage.setItem("latestMessageSummary", mockSummary);
    } finally {
      setIsGenerating(false);
      setSelectedMessages([]);
    }
  };

  const handleDateSubmit = () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    const mockDateSummary = `📅 Summary for ${selectedDate}
────────────────────────────────
Team discussed updates and general progress.
This is a placeholder summary for that day's messages.
────────────────────────────────
Generated on ${new Date().toLocaleString()}`;

    setSummary(mockDateSummary);
    localStorage.setItem("latestMessageSummary", mockDateSummary);
    setShowDatePicker(false);
  };

  const handleDownloadPDF = () => {
    if (!summary) return;

    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
      orientation: "portrait",
    });

    const margin = 50;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // indigo
    doc.text("Message Summary", margin, margin + 10);

    // Timestamp
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // gray
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 30);

    // Line
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(1);
    doc.line(margin, margin + 40, pageWidth - margin, margin + 40);

    // Summary content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    const splitText = doc.splitTextToSize(summary, contentWidth);

    let yPosition = margin + 60;
    const lineHeight = 14;

    splitText.forEach((line: string) => {
      if (yPosition > pageHeight - margin - 40) {
        doc.addPage();
        yPosition = margin + 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    // Footer
    const footerY = pageHeight - 30;
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Whooper - AI-Powered Chat Summary", margin, footerY);

    doc.save(`message-summary-${new Date().toISOString().split('T')[0]}.pdf`);
  };

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
        // Set first suggestion as selected by default
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

  const handleSendEmail = async () => {
    if (!summary) {
      alert('Please generate a summary first');
      return;
    }

    // Fetch AI subject suggestions before showing recipient selector
    await fetchSubjectSuggestions();

    // Show recipient selector
    setShowRecipientSelector(true);
  };

  const sendEmailWithRecipient = async () => {
    const recipient = customRecipient.trim() || selectedRecipient;

    if (!recipient) {
      alert('Please select or enter a recipient email address');
      return;
    }

    const emailList = recipient.split(',').map(e => e.trim()).filter(e => e);
    const title = selectedSubject; // Use AI-suggested or selected subject

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
      const response = await fetch(`${BACKEND_URL}/api/email/send-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          recipients: emailList
        })
      });

      const result = await response.json();

      if (result.success) {
        // Record successful email
        addEmailRecord({
          to: emailList,
          subject: title,
          snippet: summary.slice(0, 200),
          content: summary, // Store full content for resending
          type: 'summary',
          status: 'sent'
        });

        alert('✅ Summary sent successfully via email!');
        setShowRecipientSelector(false);
        setCustomRecipient('');

        // Refresh suggested recipients
        const suggested = getSuggestedRecipients();
        setSuggestedRecipients(suggested);
      } else {
        // Record failed email
        addEmailRecord({
          to: emailList,
          subject: title,
          snippet: summary.slice(0, 200),
          content: summary, // Store full content for resending
          type: 'summary',
          status: 'failed',
          error: result.message || 'Email service may not be configured'
        });

        alert('❌ Failed to send summary: ' + (result.message || 'Email service may not be configured'));
      }
    } catch (error: any) {
      console.error('Error sending email:', error);

      // Record failed email
      addEmailRecord({
        to: emailList,
        subject: title,
        snippet: summary.slice(0, 200),
        type: 'summary',
        status: 'failed',
        error: error.message || 'Network error'
      });

      alert('❌ Failed to send summary. Please check your backend and email service configuration.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={generateSummary}
          disabled={isGenerating}
          className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white text-sm rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Summary
            </>
          )}
        </button>

        {summary && (
          <>
            <button
              onClick={handleSendEmail}
              className="px-3 py-2 border border-green-600 text-green-400 rounded-lg hover:bg-green-600/20 transition-all"
              title="Send via Email"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-2 border border-indigo-600 text-indigo-400 rounded-lg hover:bg-indigo-600/20 transition-all"
              title="Download PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Date Picker (when no messages selected) */}
      {showDatePicker && (
        <div className="p-3 bg-[#1a1b2e] rounded-lg border border-gray-700">
          <p className="text-gray-300 text-xs mb-2">
            No messages selected. Choose a date to generate summary:
          </p>
          <div className="flex gap-2">
            <input
              type="date"
              className="flex-1 px-2 py-1 bg-[#0f1024] border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-indigo-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              onClick={handleDateSubmit}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
            >
              Generate
            </button>
            <button
              onClick={() => setShowDatePicker(false)}
              className="px-2 py-1 text-gray-400 text-sm hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Recipient Selector Modal */}
      {showRecipientSelector && (
        <div className="p-4 bg-[#1a1b2e] rounded-lg border border-green-600 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Summary via Email
            </h3>
            <button
              onClick={() => setShowRecipientSelector(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {/* AI Subject Line Suggestions */}
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

            {/* Suggested Recipients Dropdown */}
            {suggestedRecipients.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">
                  Select from recent recipients:
                </label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => {
                    setSelectedRecipient(e.target.value);
                    setCustomRecipient('');
                  }}
                  className="w-full bg-[#0f1024] text-white p-2 rounded border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
                >
                  <option value="">-- Select Recipient --</option>
                  {suggestedRecipients.map((email) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Email Input */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">
                Or enter email address{suggestedRecipients.length > 0 ? ' manually' : ''}:
              </label>
              <input
                type="email"
                placeholder="email@example.com or leave blank for default"
                value={customRecipient}
                onChange={(e) => {
                  setCustomRecipient(e.target.value);
                  setSelectedRecipient('');
                }}
                className="w-full bg-[#0f1024] text-white p-2 rounded border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple emails with commas
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={sendEmailWithRecipient}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-all"
              >
                Send Email
              </button>
              <button
                onClick={() => {
                  setShowRecipientSelector(false);
                  setCustomRecipient('');
                  setSelectedRecipient('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-sm">No messages available</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                selectedMessages.includes(msg.id)
                  ? "bg-indigo-900/50 border-2 border-indigo-500"
                  : "bg-[#1a1b2e] border border-gray-700 hover:border-indigo-600/50"
              }`}
            >
              <p className="text-sm text-gray-100 pr-16">{msg.text}</p>
              {msg.timestamp && (
                <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
              )}

              {/* Hover Select Button */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleSelect(msg.id)}
                  className="text-xs px-2 py-1 rounded bg-[#0f1024] border border-gray-600 hover:bg-indigo-600 hover:border-indigo-500 text-gray-300 hover:text-white transition-all"
                >
                  {selectedMessages.includes(msg.id) ? "✓ Selected" : "Select"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedMessages.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {selectedMessages.length} message{selectedMessages.length !== 1 ? 's' : ''} selected
        </p>
      )}

      {/* Summary Display */}
      {summary && (
        <div className="mt-4 p-4 bg-[#1a1b2e] border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-indigo-400">Latest Summary</h4>
            <button
              onClick={() => {
                setSummary("");
                localStorage.removeItem("latestMessageSummary");
              }}
              className="text-xs text-gray-500 hover:text-red-400 transition"
            >
              Clear
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-xs text-gray-300 font-mono max-h-60 overflow-y-auto custom-scrollbar">
            {summary}
          </pre>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1b2e;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
    </div>
  );
};

export default MessageSummaryGenerator;
