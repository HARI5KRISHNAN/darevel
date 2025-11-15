import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocalMeetings, Meeting } from "../hooks/useLocalMeetings";

interface MeetingSchedulerV2Props {
  isOpen: boolean;
  onClose: () => void;
}

const MeetingSchedulerV2: React.FC<MeetingSchedulerV2Props> = ({ isOpen, onClose }) => {
  const { meetings, saveMeeting, deleteMeeting, getUpcomingMeetings } = useLocalMeetings();
  const [meetingTitle, setMeetingTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const [meetingDateTime, setMeetingDateTime] = useState<Date | null>(null);
  const [description, setDescription] = useState("");

  const handleSchedule = () => {
    if (!meetingTitle.trim() || !participants.trim() || !meetingDateTime) {
      alert("Please fill in title, participants, and date/time.");
      return;
    }

    const participantEmails = participants
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (participantEmails.length === 0) {
      alert("Please enter at least one participant email.");
      return;
    }

    const newMeeting: Meeting = {
      id: `meeting_${Date.now()}`,
      title: meetingTitle,
      participants: participantEmails,
      dateTime: meetingDateTime.toISOString(),
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const success = saveMeeting(newMeeting);
    if (success) {
      console.log("📅 Meeting Scheduled:", newMeeting);
      // Reset form
      setMeetingTitle("");
      setParticipants("");
      setMeetingDateTime(null);
      setDescription("");
      // Don't close modal - show success in list
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this meeting?")) {
      deleteMeeting(id);
    }
  };

  const upcomingMeetings = getUpcomingMeetings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1120] border border-gray-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Schedule Meeting</h2>
              <p className="text-sm text-gray-400">Set up a video call with your team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left Column: Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Meeting Details</h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meeting Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g., Q4 Team Sync"
                className="w-full px-4 py-3 bg-[#1c1f35] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Participants <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder="alice@company.com, bob@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#1c1f35] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Separate emails with commas</p>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date & Time <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <DatePicker
                  selected={meetingDateTime}
                  onChange={(date) => setMeetingDateTime(date)}
                  showTimeSelect
                  dateFormat="MMM d, yyyy h:mm aa"
                  placeholderText="Select date and time"
                  minDate={new Date()}
                  className="w-full pl-10 pr-4 py-3 bg-[#1c1f35] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Meeting agenda, notes, or details..."
                rows={3}
                className="w-full px-4 py-3 bg-[#1c1f35] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Schedule Button */}
            <button
              onClick={handleSchedule}
              disabled={!meetingTitle.trim() || !participants.trim() || !meetingDateTime}
              className="w-full px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Schedule Meeting
            </button>
          </div>

          {/* Right Column: Upcoming Meetings List */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Upcoming Meetings ({upcomingMeetings.length})
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm">No upcoming meetings</p>
                  <p className="text-gray-600 text-xs mt-1">Schedule one to get started!</p>
                </div>
              ) : (
                upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="bg-[#1c1f35] border border-gray-700 rounded-lg p-4 hover:border-indigo-600/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">{meeting.title}</h4>
                        <p className="text-sm text-indigo-400 mt-1">
                          {new Date(meeting.dateTime).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {meeting.participants.length} participant{meeting.participants.length !== 1 ? "s" : ""}
                        </p>
                        {meeting.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{meeting.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(meeting.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Delete meeting"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700 bg-[#0a0c16]">
          <p className="text-xs text-gray-500">Phase 1: UI Only (No backend yet)</p>
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-[#1c1f35] transition-all"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1c1f35;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
    </div>
  );
};

export default MeetingSchedulerV2;
