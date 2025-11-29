import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useNotificationStore } from './store/useNotificationStore';
import { NotificationBell } from './components/notifications/NotificationBell';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { Home } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-opacity-90 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-700">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">D</div>
              Darevel Notification
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link to="/" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              <Link to="/notifications" className="hover:text-blue-600 transition-colors">Notifications</Link>
              <a href="#" className="hover:text-blue-600 transition-colors">Projects</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Team</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
             <NotificationBell />
             
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
               JS
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex items-start gap-8 px-4 sm:px-6 lg:px-8 py-8">
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
        
        <aside className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <RecentActivity />
            
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-md">
              <h4 className="font-bold mb-2">Upgrade to Pro</h4>
              <p className="text-sm opacity-90 mb-4">Get unlimited history and advanced filters.</p>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors border border-white/20">
                View Plans
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <div className="w-full">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
       <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
         <Home size={32} />
       </div>
       <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Darevel Notification</h2>
       <p className="text-gray-500 max-w-lg mx-auto mb-8">
         This is the dashboard. Click the bell icon in the top right to interact with the 
         Global Notification Center implementation.
       </p>
       <div className="flex justify-center gap-4">
         <Link to="/notifications" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Go to Full Notifications
         </Link>
         <Link to="/settings/notifications" className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Configure Settings
         </Link>
       </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const { initWebSocket, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    initWebSocket();
  }, [initWebSocket, fetchNotifications]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings/notifications" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
