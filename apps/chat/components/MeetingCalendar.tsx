import React, { useState, useEffect, useCallback } from 'react';
import { getKeycloakToken } from '../services/keycloak';

export interface Meeting {
    id: number;
    title: string;
    startTime: Date;
    endTime: Date;
    meetingLink?: string;
    roomName?: string;
    organizerId?: number;
    organizerName?: string;
    status?: string;
}

interface MeetingCalendarProps {
    collapsed?: boolean;
    onScheduleMeeting?: () => void;
    onJoinMeeting?: (meeting: Meeting) => void;
    onDateSelect?: (meetings: Meeting[]) => void;
}

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8082';

const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
    collapsed = false,
    onScheduleMeeting,
    onJoinMeeting,
    onDateSelect,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch meetings for the current month
    const fetchMeetings = useCallback(async () => {
        setLoading(true);
        try {
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

            const token = getKeycloakToken();
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${CHAT_API_URL}/api/meetings/range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
                { headers }
            );

            if (response.ok) {
                const data = await response.json();
                setMeetings(data.map((m: any) => ({
                    ...m,
                    startTime: new Date(m.startTime),
                    endTime: new Date(m.endTime),
                })));
            }
        } catch (error) {
            console.error('Failed to fetch meetings:', error);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchMeetings();
    }, [fetchMeetings]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        return { daysInMonth, firstDayOfMonth };
    };

    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

    const getMeetingsOnDay = (day: number): Meeting[] => {
        return meetings.filter(m => {
            const meetingDate = new Date(m.startTime);
            return meetingDate.getDate() === day &&
                   meetingDate.getMonth() === currentDate.getMonth() &&
                   meetingDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const hasMeetingOnDay = (day: number) => getMeetingsOnDay(day).length > 0;

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDay(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDay(null);
    };

    const handleDayClick = (day: number) => {
        setSelectedDay(day);
        const dayMeetings = getMeetingsOnDay(day);
        if (onDateSelect) {
            onDateSelect(dayMeetings);
        }
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
               currentDate.getMonth() === today.getMonth() &&
               currentDate.getFullYear() === today.getFullYear();
    };

    if (collapsed) {
        const todayMeetings = getMeetingsOnDay(new Date().getDate());
        return (
            <div className="flex flex-col items-center gap-2">
                <button
                    onClick={onScheduleMeeting}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    title="Meeting Calendar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
                {todayMeetings.length > 0 && (
                    <span className="text-xs text-green-400">{todayMeetings.length}</span>
                )}
            </div>
        );
    }

    return (
        <div className="bg-background-secondary rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">Meeting Calendar</h3>
                {loading && (
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                )}
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-2">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-700 rounded text-text-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-xs text-text-primary font-medium">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-700 rounded text-text-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-xs text-text-secondary py-1 font-medium">{day}</div>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const hasMeeting = hasMeetingOnDay(day);
                    const meetingCount = getMeetingsOnDay(day).length;
                    const isSelected = selectedDay === day;
                    const isTodayDate = isToday(day);

                    return (
                        <div
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`
                                text-xs py-1 rounded cursor-pointer transition-all relative
                                ${isTodayDate ? 'bg-indigo-600 text-white font-bold' : ''}
                                ${isSelected && !isTodayDate ? 'bg-indigo-500 text-white' : ''}
                                ${!isTodayDate && !isSelected ? 'text-text-primary hover:bg-gray-700' : ''}
                                ${hasMeeting ? 'ring-2 ring-green-500 ring-offset-1 ring-offset-gray-800' : ''}
                            `}
                        >
                            {day}
                            {meetingCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">
                                    {meetingCount}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Quick view of today's meetings */}
            {getMeetingsOnDay(new Date().getDate()).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-text-secondary mb-2">Today's Meetings</div>
                    {getMeetingsOnDay(new Date().getDate()).slice(0, 2).map(meeting => (
                        <div key={meeting.id} className="flex items-center justify-between bg-gray-700 rounded p-2 mb-1">
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-text-primary truncate">{meeting.title}</div>
                                <div className="text-xs text-text-secondary">
                                    {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            {meeting.meetingLink && onJoinMeeting && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onJoinMeeting(meeting);
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs ml-2"
                                >
                                    Join
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MeetingCalendar;
