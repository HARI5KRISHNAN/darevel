import React, { useState, useCallback } from 'react';
import MeetingSchedulerV2 from './MeetingSchedulerV2';
import MeetingCalendar from './MeetingCalendar';
import TodoNotes from './TodoNotes';
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from './icons';

export interface Meeting {
    id: number;
    title: string;
    startTime: Date;
    endTime: Date;
    meetingLink?: string;
    roomName?: string;
}

const RightSidebar: React.FC = () => {
    const [isMeetingSchedulerOpen, setIsMeetingSchedulerOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedDateMeetings, setSelectedDateMeetings] = useState<Meeting[]>([]);
    const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

    // Force calendar to refresh when a meeting is created
    const handleMeetingCreated = useCallback(() => {
        setCalendarRefreshKey(prev => prev + 1);
    }, []);

    return (
        <>
            <aside className={`bg-background-panel p-4 flex-col gap-6 border-l border-border-color hidden lg:flex transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'}`}>
                {/* Collapse/Expand Button */}
                <div className="flex justify-between items-center">
                    {!isCollapsed && <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Quick Actions</h2>}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-text-secondary hover:text-text-primary p-1 ml-auto shrink-0"
                        aria-label={isCollapsed ? 'Expand quick actions' : 'Collapse quick actions'}
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed ? <DoubleArrowLeftIcon className="w-5 h-5" /> : <DoubleArrowRightIcon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Meeting Scheduler Section */}
                <div className="space-y-4">
                     {isCollapsed ? (
                        // Collapsed view - icon only
                        <button
                            onClick={() => setIsMeetingSchedulerOpen(true)}
                            className="w-full flex justify-center p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                            title="Schedule a new meeting"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                        </button>
                     ) : (
                        // Expanded view - full button
                        <button
                            onClick={() => setIsMeetingSchedulerOpen(true)}
                            className="w-full flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                            title="Schedule a new meeting"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                            <span>Schedule Meeting</span>
                        </button>
                     )}
                </div>

                {/* Meeting Calendar Section */}
                <div className="space-y-4">
                    <MeetingCalendar
                        key={calendarRefreshKey}
                        collapsed={isCollapsed}
                        onScheduleMeeting={() => setIsMeetingSchedulerOpen(true)}
                        onDateSelect={(meetings) => setSelectedDateMeetings(meetings)}
                        onJoinMeeting={(meeting) => {
                            if (meeting.meetingLink) {
                                window.open(meeting.meetingLink, '_blank');
                            }
                        }}
                    />
                </div>

                {/* Selected Date Meetings - shown as todo list */}
                {!isCollapsed && selectedDateMeetings.length > 0 && (
                    <div className="bg-background-secondary rounded-lg p-3">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">Scheduled Meetings</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedDateMeetings.map(meeting => (
                                <div key={meeting.id} className="flex items-center gap-2 bg-gray-700 rounded p-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-text-primary truncate">{meeting.title}</div>
                                        <div className="text-xs text-text-secondary">
                                            {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    {meeting.meetingLink && (
                                        <button
                                            onClick={() => window.open(meeting.meetingLink, '_blank')}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs flex-shrink-0"
                                        >
                                            Join
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* To-Do Notes Section */}
                <div className="space-y-4">
                    <TodoNotes collapsed={isCollapsed} />
                </div>
        </aside>

        {/* Meeting Scheduler Modal */}
        <MeetingSchedulerV2
            isOpen={isMeetingSchedulerOpen}
            onClose={() => setIsMeetingSchedulerOpen(false)}
            onMeetingCreated={handleMeetingCreated}
        />
        </>
    );
};

export default RightSidebar;