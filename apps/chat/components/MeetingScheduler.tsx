import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocalMeetings, Meeting } from "../hooks/useLocalMeetings";

interface MeetingSchedulerProps {
  open: boolean;
  setOpen: (val: boolean) => void;
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({ open, setOpen }) => {
  const { meetings, addMeeting } = useLocalMeetings();
  const [meetingTitle, setMeetingTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const [meetingDate, setMeetingDate] = useState<Date | null>(null);

  const handleScheduleMeeting = () => {
    if (!meetingTitle.trim() || !participants.trim() || !meetingDate) {
      alert("Please fill in all required fields.");
      return;
    }

    const newMeeting: Meeting = {
      title: meetingTitle,
      participants,
      date: meetingDate,
    };

    addMeeting(newMeeting);
    console.log("📅 Meeting Scheduled:", newMeeting);

    // Reset form and close modal
    setMeetingTitle("");
    setParticipants("");
    setMeetingDate(null);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setMeetingTitle("");
    setParticipants("");
    setMeetingDate(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1024] text-white border border-[#1a1b2e] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a1b2e]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <h2 className="text-xl font-bold text-indigo-400">Schedule Meeting</h2>
              <p className="text-sm text-gray-400">Set up your next team meeting</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Meeting Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meeting Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="e.g., Q4 Planning Discussion"
              className="w-full px-4 py-3 bg-[#1a1b2e] border-none rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Participants <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="alice@company.com, bob@company.com"
              className="w-full px-4 py-3 bg-[#1a1b2e] border-none rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">Separate multiple emails with commas</p>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date & Time <span className="text-red-400">*</span>
            </label>
            <DatePicker
              selected={meetingDate}
              onChange={(date) => setMeetingDate(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Select date and time"
              minDate={new Date()}
              className="w-full px-4 py-3 bg-[#1a1b2e] border-none rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Upcoming Meetings List */}
          {meetings.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm text-gray-400 mb-2 font-semibold">Upcoming Meetings ({meetings.length})</h3>
              <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {meetings.map((m, idx) => (
                  <li key={idx} className="flex justify-between bg-[#1a1b2e] p-3 rounded-md hover:bg-[#252640] transition">
                    <span className="text-white font-medium">{m.title}</span>
                    <span className="text-indigo-400">{new Date(m.date).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1a1b2e]">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-[#1a1b2e] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleScheduleMeeting}
            disabled={!meetingTitle.trim() || !participants.trim() || !meetingDate}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduler;
