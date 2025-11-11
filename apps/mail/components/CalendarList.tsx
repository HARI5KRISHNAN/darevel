import React, { useEffect, useState } from 'react';
import api from '../api';
import { CalendarIcon } from '../constants';

interface Meeting {
  id: number;
  title: string;
  description: string;
  scheduled_at: string;
  duration: number;
  room_name: string;
  organizer_email: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  recording_url: string | null;
  created_at: string;
  updated_at: string;
}

interface CalendarListProps {
  onJoinMeeting?: (meetingData: { roomName: string; displayName: string; meetingId: number }) => void;
}

const CalendarList: React.FC<CalendarListProps> = ({ onJoinMeeting }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mail/calendar/meetings');
      if (response.data.ok) {
        setMeetings(response.data.meetings || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    if (onJoinMeeting) {
      onJoinMeeting({
        roomName: meeting.room_name,
        displayName: 'User',
        meetingId: meeting.id
      });
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchMeetings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">My Meetings</h1>
          </div>
          <p className="text-slate-500">View and join your scheduled meetings</p>
        </div>

        {/* Meetings List */}
        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No meetings yet</h3>
            <p className="text-slate-500">Your scheduled meetings will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-1">
                      {meeting.title}
                    </h3>
                    {meeting.description && (
                      <p className="text-slate-600 text-sm mb-2">{meeting.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDateTime(meeting.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {meeting.duration} min
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(meeting.status)}`}>
                    {meeting.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Join Meeting Button */}
                  {meeting.status !== 'cancelled' && meeting.status !== 'completed' && onJoinMeeting && (
                    <button
                      onClick={() => handleJoinMeeting(meeting)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Meeting
                    </button>
                  )}

                  {/* Watch Recording Button */}
                  {meeting.recording_url && (
                    <a
                      href={meeting.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Watch Recording
                    </a>
                  )}

                  {/* Meeting Details */}
                  <div className="ml-auto text-right">
                    <p className="text-xs text-slate-500">Room: {meeting.room_name}</p>
                    <p className="text-xs text-slate-500">Organizer: {meeting.organizer_email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarList;
