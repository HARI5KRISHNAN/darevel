
import React from 'react';

interface MenuBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Presentation specific tabs
const TABS = ['Home', 'Insert', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Review', 'View'];

const MenuBar: React.FC<MenuBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-end space-x-1 pl-2 select-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              px-4 py-1.5 text-sm font-medium rounded-t-lg transition-all border-t border-x
              ${isActive 
                ? 'bg-white dark:bg-[#0f172a] text-blue-600 dark:text-blue-400 border-slate-200 dark:border-slate-700 border-b-transparent relative z-10 translate-y-[1px]' 
                : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }
            `}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default MenuBar;
