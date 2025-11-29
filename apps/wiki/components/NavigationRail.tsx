import React from 'react';
import { 
  Folder, PlusSquare, Search, Clock, Star, 
  LayoutTemplate, Hash, Trash2, 
  Settings, Sun
} from 'lucide-react';

const NavigationRail: React.FC = () => {
  const NavItem = ({ icon: Icon, label, active = false, colorClass = "group-hover:text-[#38E1D3]" }: any) => (
    <button className={`
      relative group p-3 rounded-xl transition-all duration-200 flex items-center justify-center
      ${active ? 'bg-white/10 text-[#38E1D3]' : 'text-gray-400 hover:bg-white/5 ' + colorClass}
    `}>
      <Icon size={22} strokeWidth={1.5} />
      
      {/* Active Indicator glow */}
      {active && (
        <div className="absolute inset-0 bg-[#38E1D3]/20 blur-lg rounded-xl pointer-events-none" />
      )}

      {/* Tooltip */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#1C2128] text-gray-200 text-xs font-medium px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gray-700 shadow-xl z-50">
        {label}
        {/* Little arrow pointing left */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1C2128] rotate-45 border-l border-b border-gray-700"></div>
      </div>
    </button>
  );

  return (
    <div className="w-[72px] h-screen bg-[#0D1117] flex flex-col items-center py-6 border-r border-gray-800/50 flex-shrink-0 z-30 select-none">
      {/* Logo */}
      <div className="w-10 h-10 mb-8 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M12 12L2 12A10 10 0 0 1 12 2L12 12Z" fill="#4285F4" />
           <path d="M12 12L12 2A10 10 0 0 1 22 12L12 12Z" fill="#EA4335" />
           <path d="M12 12L22 12A10 10 0 0 1 12 22L12 12Z" fill="#FBBC04" />
           <path d="M12 12L12 22A10 10 0 0 1 2 12L12 12Z" fill="#34A853" />
        </svg>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col gap-3 w-full items-center px-2">
        <NavItem icon={Folder} label="Spaces Browser" active />
        <NavItem icon={PlusSquare} label="New Page" colorClass="group-hover:text-blue-400" />
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-800/60 my-4" />

      {/* Navigation */}
      <div className="flex flex-col gap-3 w-full items-center px-2">
        <NavItem icon={Search} label="Quick Find (⌘K)" />
        <NavItem icon={Clock} label="Recent Pages" />
        <NavItem icon={Star} label="Favorites" colorClass="group-hover:text-yellow-400" />
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-800/60 my-4" />

      {/* Organization */}
      <div className="flex flex-col gap-3 w-full items-center px-2">
        <NavItem icon={LayoutTemplate} label="Templates" />
        <NavItem icon={Hash} label="Tags" />
      </div>

      <div className="flex-1" />

      {/* Footer Actions */}
      <div className="flex flex-col gap-3 w-full items-center pb-2 px-2">
        <NavItem icon={Trash2} label="Trash" colorClass="group-hover:text-red-400" />
        <NavItem icon={Settings} label="Settings" />
        <NavItem icon={Sun} label="Theme" />
      </div>
    </div>
  );
};

export default NavigationRail;