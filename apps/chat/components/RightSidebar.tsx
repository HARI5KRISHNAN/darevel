import React, { useState } from 'react';
import { ModelIcon } from './icons';
import MeetingSchedulerV2 from './MeetingSchedulerV2';
import MessageSummaryGenerator from './MessageSummaryGenerator';
import PodAlertsPanel from './PodAlertsPanel';
import EmailHistory from './EmailHistory';

interface CommunityProps {
    icon: string | React.ReactNode;
    name: string;
    bgColor: string;
}

const CommunityItem: React.FC<CommunityProps> = ({ icon, name, bgColor }) => (
    <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white ${bgColor}`}>
            {icon}
        </div>
        <span className="font-semibold text-sm text-text-primary truncate">{name}</span>
    </div>
);

interface PersonProps {
    avatar: string;
    name: string;
    handle: string;
}

const PersonItem: React.FC<PersonProps> = ({ avatar, name, handle }) => (
    <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
        <div>
            <p className="font-semibold text-sm text-text-primary">{name}</p>
            <p className="text-xs text-text-secondary">{handle}</p>
        </div>
    </div>
);


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

    const communities: CommunityProps[] = [
        { icon: 'I', name: 'Introductions', bgColor: 'bg-indigo-600' },
        { icon: 'W', name: "What's New On Sh...", bgColor: 'bg-green-600' },
        { icon: <ModelIcon className="w-5 h-5"/>, name: 'DesignNews', bgColor: 'bg-sky-600' },
        { icon: 'Be', name: 'Behance', bgColor: 'bg-blue-600' },
        { icon: 'Fi', name: 'Figma Community', bgColor: 'bg-red-600' },
    ];

    const people: PersonProps[] = [
        { avatar: 'https://i.pravatar.cc/40?u=1', name: 'Patrick Newman', handle: '@patricknewman' },
        { avatar: 'https://i.pravatar.cc/40?u=2', name: 'Yulia Polischuk', handle: '@thisisjulka' },
        { avatar: 'https://i.pravatar.cc/40?u=3', name: 'Amanda Freeze', handle: '@meow_amanda97' },
        { avatar: 'https://i.pravatar.cc/40?u=4', name: 'Anatoly Belik', handle: '@belik_anatoly' },
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

                {/* Email History Section */}
                <div className="space-y-4">
                    <EmailHistory />
                </div>

            <div className="space-y-4">
                 <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Top Communities</h2>
                 <div className="space-y-3">
                    {communities.map(c => <CommunityItem key={c.name} {...c} />)}
                 </div>
            </div>
             <div className="space-y-4">
                 <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Suggested People</h2>
                 <div className="space-y-3">
                    {people.map(p => <PersonItem key={p.name} {...p} />)}
                 </div>
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