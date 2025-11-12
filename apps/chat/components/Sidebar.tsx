import React from 'react';

interface SidebarProps {
  onScheduleClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onScheduleClick }) => {
  return (
    <aside className="w-64 bg-[#0b0c1d] h-full flex flex-col justify-between border-r border-[#1a1b2e]">
      <div>
        <h1 className="text-xl font-bold text-indigo-400 p-4">Whooper</h1>

        <nav className="px-3">
          <SidebarItem icon="🏠" label="Home" active />
          <SidebarItem icon="💬" label="Messages" />
          <SidebarItem icon="🛡️" label="Permission" />
          <SidebarItem icon="🖥️" label="Pod Status" />

          {/* Schedule Meeting Quick Action */}
          <button
            onClick={onScheduleClick}
            className="flex items-center gap-3 w-full px-3 py-2 mt-3 rounded-lg hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 transition"
          >
            <span className="text-lg">📹</span>
            <span>Schedule Meeting</span>
          </button>

          <SidebarItem icon="⚙️" label="Settings" />
        </nav>
      </div>

      <div className="p-4 text-sm text-gray-500 border-t border-[#1a1b2e]">
        <p>© 2025 Whooper Inc.</p>
      </div>
    </aside>
  );
};

interface SidebarItemProps {
  icon: string;
  label: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active }) => {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 mb-1 rounded-lg cursor-pointer transition ${
        active
          ? 'bg-indigo-600/20 text-indigo-300'
          : 'text-gray-400 hover:bg-[#14152b] hover:text-white'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </div>
  );
};

export default Sidebar;
