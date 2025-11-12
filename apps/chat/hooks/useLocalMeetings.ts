import { useEffect, useState } from "react";

export interface Meeting {
  id: string;
  title: string;
  participants: string[];
  dateTime: string;
  description?: string;
  createdAt: string;
}

const STORAGE_KEY = "whooper_meetings";

export function useLocalMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load meetings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out past meetings older than 24 hours
        const now = new Date();
        const filtered = parsed.filter((meeting: Meeting) => {
          const meetingDate = new Date(meeting.dateTime);
          const hoursSince = (now.getTime() - meetingDate.getTime()) / (1000 * 60 * 60);
          return hoursSince < 24; // Keep meetings from last 24 hours
        });
        setMeetings(filtered);
        // Update storage if we filtered any out
        if (filtered.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
      }
    } catch (error) {
      console.error("Failed to load meetings from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save meeting
  const saveMeeting = (meeting: Meeting) => {
    try {
      const updated = [...meetings, meeting];
      // Sort by date
      updated.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      setMeetings(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error("Failed to save meeting:", error);
      return false;
    }
  };

  // Delete meeting
  const deleteMeeting = (id: string) => {
    try {
      const updated = meetings.filter((m) => m.id !== id);
      setMeetings(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      return false;
    }
  };

  // Get upcoming meetings (future only)
  const getUpcomingMeetings = () => {
    const now = new Date();
    return meetings.filter((meeting) => new Date(meeting.dateTime) > now);
  };

  // Get past meetings (last 24 hours)
  const getPastMeetings = () => {
    const now = new Date();
    return meetings.filter((meeting) => new Date(meeting.dateTime) <= now);
  };

  // Also provide addMeeting for compatibility with MessageSummaryGenerator
  const addMeeting = (meeting: { title: string; participants: string; date: Date }) => {
    const newMeeting: Meeting = {
      id: `meeting_${Date.now()}`,
      title: meeting.title,
      participants: meeting.participants.split(',').map(p => p.trim()),
      dateTime: meeting.date.toISOString(),
      createdAt: new Date().toISOString(),
    };
    return saveMeeting(newMeeting);
  };

  return {
    meetings,
    isLoading,
    saveMeeting,
    deleteMeeting,
    getUpcomingMeetings,
    getPastMeetings,
    addMeeting, // For compatibility with simplified MeetingScheduler
  };
}
