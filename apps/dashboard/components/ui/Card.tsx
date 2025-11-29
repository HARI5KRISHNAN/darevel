import React, { ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface CardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, action, className = "", noPadding = false }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-slate-500">{icon}</span>}
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        </div>
        <div>
          {action ? action : (
            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          )}
        </div>
      </div>
      <div className={`flex-1 overflow-hidden ${noPadding ? '' : 'p-5'}`}>
        {children}
      </div>
    </div>
  );
};
