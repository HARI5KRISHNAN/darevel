import React, { useState } from 'react';
import MeetingSchedulerV2 from './MeetingSchedulerV2';
import MessageSummaryGenerator from './MessageSummaryGenerator';
import PodAlertsPanel from './PodAlertsPanel';


const RightSidebar: React.FC = () => {
    const [isMeetingSchedulerOpen, setIsMeetingSchedulerOpen] = useState(false);

    // Sample messages for the summary generator
    const sampleMessages = [
        { id: 1, text: "Discussed the new microservice deployment strategy for Q4", timestamp: "10:30 AM" },
        { id: 2, text: "Fixed critical API authentication bug in production pod", timestamp: "11:15 AM" },
        { id: 3, text: "Planned CI/CD pipeline improvements with Jenkins integration", timestamp: "2:00 PM" },
        { id: 4, text: "Team agreed on the new coding standards document", timestamp: "3:45 PM" },
        { id: 5, text: "Scheduled architecture review meeting for next week", timestamp: "4:20 PM" },
    ];

    return (
        <>
            <aside className="w-72 bg-background-panel p-4 flex-col gap-6 border-l border-border-color hidden lg:flex">
                {/* Meeting Scheduler Section */}
                <div className="space-y-4">
                     <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Quick Actions</h2>
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
                </div>

                {/* Pod Status & Message Summary Section */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pod Status & AI Summary</h2>
                    <MessageSummaryGenerator messages={sampleMessages} />
                </div>

                {/* Pod Alerts Section */}
                <div className="space-y-4">
                    <PodAlertsPanel />
                </div>
        </aside>

        {/* Meeting Scheduler Modal */}
        <MeetingSchedulerV2
            isOpen={isMeetingSchedulerOpen}
            onClose={() => setIsMeetingSchedulerOpen(false)}
        />
        </>
    );
};

export default RightSidebar;