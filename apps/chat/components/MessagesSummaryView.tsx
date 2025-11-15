import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import { Message } from "../types";

interface MessagesSummaryViewProps {
  messages: Message[];
  onGenerateSummary: (selectedMessages?: Message[]) => Promise<void>;
  currentSummary?: string;
  isGenerating: boolean;
}

const MessagesSummaryView: React.FC<MessagesSummaryViewProps> = ({
  messages,
  onGenerateSummary,
  currentSummary,
  isGenerating,
}) => {
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<string>(currentSummary || "");
  const [selectionsLoaded, setSelectionsLoaded] = useState(false);

  // Load previously selected messages from localStorage on mount
  React.useEffect(() => {
    try {
      const savedSelections = localStorage.getItem("chatSummarySelectedMessages");
      if (savedSelections) {
        const parsed = JSON.parse(savedSelections);
        setSelectedMessageIds(parsed);
        setSelectionsLoaded(true);
        // Auto-hide the indicator after 3 seconds
        setTimeout(() => setSelectionsLoaded(false), 3000);
      }
    } catch (err) {
      console.error("Failed to load saved selections:", err);
    }
  }, []);

  // Save selections to localStorage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem("chatSummarySelectedMessages", JSON.stringify(selectedMessageIds));
    } catch (err) {
      console.error("Failed to save selections:", err);
    }
  }, [selectedMessageIds]);

  // Update local summary when prop changes
  React.useEffect(() => {
    if (currentSummary) {
      setGeneratedSummary(currentSummary);
    }
  }, [currentSummary]);

  // Filter by selected date
  const filteredMessages = selectedDate
    ? messages.filter((msg) => {
        if (!msg.timestamp) return false;
        const msgDate = new Date(msg.timestamp);
        return msgDate.toDateString() === selectedDate.toDateString();
      })
    : messages;

  // Filter out summary messages from the list
  const displayMessages = filteredMessages.filter(msg => msg.type !== 'summary');

  // Handle message checkbox selection
  const handleSelectMessage = (id: number) => {
    setSelectedMessageIds((prev) =>
      prev.includes(id)
        ? prev.filter((msgId) => msgId !== id)
        : [...prev, id]
    );
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectedMessageIds.length === displayMessages.length) {
      setSelectedMessageIds([]);
    } else {
      setSelectedMessageIds(displayMessages.map(msg => msg.id));
    }
  };

  // Handle clear all selections
  const handleClearSelections = () => {
    setSelectedMessageIds([]);
    localStorage.removeItem("chatSummarySelectedMessages");
  };

  // Generate AI Summary
  const handleGenerateSummary = async () => {
    try {
      const messagesToSummarize = selectedMessageIds.length > 0
        ? displayMessages.filter((msg) => selectedMessageIds.includes(msg.id))
        : displayMessages;

      if (messagesToSummarize.length === 0) {
        alert("No messages found for the selected date or selection.");
        return;
      }

      await onGenerateSummary(messagesToSummarize);
    } catch (err: any) {
      console.error("Error generating summary:", err);
      alert(err.message || "Failed to generate summary");
    }
  };

  // Copy summary to clipboard
  const handleCopySummary = async () => {
    if (!generatedSummary) {
      alert("No summary available to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedSummary);
      alert("Summary copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy to clipboard. Please try again.");
    }
  };

  // Export summary as PDF with professional formatting
  const handleDownloadPDF = () => {
    if (!generatedSummary) {
      alert("No summary available to download.");
      return;
    }

    try {
      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
        orientation: "portrait",
      });

      const margin = 50;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;

      // ===== HEADER SECTION =====
      // Main Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(31, 41, 55); // gray-800
      const title = selectedDate
        ? `Chat Summary Report - ${selectedDate.toDateString()}`
        : "Chat Summary Report";
      doc.text(title, margin, margin + 10);

      // Subtitle with timestamp
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128); // gray-500
      const timestamp = `Generated on: ${new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      })}`;
      doc.text(timestamp, margin, margin + 30);

      // Horizontal line
      doc.setDrawColor(209, 213, 219); // gray-300
      doc.setLineWidth(1);
      doc.line(margin, margin + 45, pageWidth - margin, margin + 45);

      // ===== CONTENT SECTION =====
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(55, 65, 81); // gray-700
      doc.text("Summary", margin, margin + 70);

      // Summary content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55); // gray-800
      const splitText = doc.splitTextToSize(generatedSummary, contentWidth);

      let yPosition = margin + 90;
      const lineHeight = 14;

      // Handle pagination if content is too long
      splitText.forEach((line: string) => {
        if (yPosition > pageHeight - margin - 60) {
          doc.addPage();
          yPosition = margin + 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // ===== FOOTER SECTION =====
      const footerY = pageHeight - 40;

      // Footer line
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.5);
      doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

      // Footer text
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175); // gray-400
      doc.text("Generated by AI Summary Tool powered by Gemini", margin, footerY);

      // Page number (bottom right)
      doc.setFont("helvetica", "normal");
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin - 50,
          footerY,
          { align: "right" }
        );
      }

      // Save with formatted filename
      const dateStr = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      const fileName = `chat-summary-${dateStr}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <span>📅</span>
        Message Summary Generator
      </h2>

      {/* Loaded Selections Indicator */}
      {selectionsLoaded && selectedMessageIds.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
            Restored {selectedMessageIds.length} previously selected message{selectedMessageIds.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Date Picker */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <label className="font-medium text-gray-700 dark:text-gray-300">Select Date:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          placeholderText="Choose date (optional)"
          className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          dateFormat="MMM dd, yyyy"
        />
        {selectedDate && (
          <button
            className="text-sm text-red-500 hover:underline font-medium"
            onClick={() => setSelectedDate(null)}
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Select All Toggle & Clear */}
      {displayMessages.length > 0 && (
        <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {selectedMessageIds.length === displayMessages.length ? "Deselect All" : "Select All"}
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({selectedMessageIds.length} of {displayMessages.length} selected)
            </span>
          </div>
          {selectedMessageIds.length > 0 && (
            <button
              onClick={handleClearSelections}
              className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium flex items-center gap-1"
              title="Clear all selections and remove from storage"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Selections
            </button>
          )}
        </div>
      )}

      {/* Message List */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 bg-gray-50 dark:bg-gray-900">
        {displayMessages.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
            {selectedDate
              ? "No messages found for this date."
              : "No messages available to summarize."}
          </p>
        ) : (
          <div className="space-y-3">
            {displayMessages.map((msg) => (
              <label
                key={msg.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedMessageIds.includes(msg.id)}
                  onChange={() => handleSelectMessage(msg.id)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 dark:text-gray-200 text-sm break-words">
                    {msg.content || "(No text content)"}
                  </p>
                  {msg.timestamp && (
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  )}
                  {msg.sender && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      From: {msg.sender.name || "Unknown"}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Generate Summary Button */}
      <button
        onClick={handleGenerateSummary}
        disabled={isGenerating || displayMessages.length === 0}
        className={`w-full py-3 rounded-lg font-semibold transition-all shadow-md ${
          isGenerating || displayMessages.length === 0
            ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-200"
            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </span>
        ) : (
          <span>✨ Generate AI Summary</span>
        )}
      </button>

      {/* Summary Display */}
      {generatedSummary && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <span>📝</span>
            Generated Summary
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-4 max-h-64 overflow-y-auto">
            {generatedSummary}
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleCopySummary}
              className="flex-1 min-w-[200px] px-5 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>📋</span>
              Copy to Clipboard
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex-1 min-w-[200px] px-5 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>📄</span>
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesSummaryView;
