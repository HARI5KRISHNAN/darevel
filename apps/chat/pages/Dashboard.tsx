import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MeetingScheduler from '../components/MeetingScheduler';

const Dashboard = () => {
  const [openMeeting, setOpenMeeting] = useState(false);

  return (
    <div className="flex h-screen bg-[#090a14] text-white">
      {/* Sidebar */}
      <Sidebar onScheduleClick={() => setOpenMeeting(true)} />

      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Projects Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#11122a] rounded-2xl p-6 border border-[#1a1b2e] hover:border-indigo-600/50 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Web Design</h3>
              <span className="text-2xl">🎨</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-indigo-400">50%</span>
              </div>
              <div className="w-full bg-[#1a1b2e] rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-[#11122a] rounded-2xl p-6 border border-[#1a1b2e] hover:border-indigo-600/50 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Mobile App</h3>
              <span className="text-2xl">📱</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-indigo-400">65%</span>
              </div>
              <div className="w-full bg-[#1a1b2e] rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-[#11122a] rounded-2xl p-6 border border-[#1a1b2e] hover:border-indigo-600/50 transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Dashboard</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-indigo-400">40%</span>
              </div>
              <div className="w-full bg-[#1a1b2e] rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Meeting Scheduler Modal */}
      <MeetingScheduler open={openMeeting} setOpen={setOpenMeeting} />
    </div>
  );
};

export default Dashboard;
