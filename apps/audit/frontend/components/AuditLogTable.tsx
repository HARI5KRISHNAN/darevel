import React from 'react';
import { AuditLog, SortConfig } from '../types';
import { ActionBadge, ResourceBadge } from './Badges';
import { ChevronRight, FileX, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './ui/Button';

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  onViewDetails: (log: AuditLog) => void;
  sortConfig: SortConfig;
  onSort: (key: keyof AuditLog) => void;
}

// Helper to generate consistent colors from a string
const getUserAvatarColor = (name: string) => {
  const colors = [
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-green-100 text-green-700',
    'bg-emerald-100 text-emerald-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700',
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-purple-100 text-purple-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-pink-100 text-pink-700',
    'bg-rose-100 text-rose-700',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ 
  logs, 
  isLoading, 
  onViewDetails,
  sortConfig,
  onSort
}) => {
  
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
             <p className="text-sm text-slate-500">Loading audit records...</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <FileX className="text-slate-400" size={24} />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No audit records found</h3>
        <p className="text-slate-500 mt-1 max-w-sm">
          We couldn't find any logs matching your current filters. Try adjusting the date range or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none"
              onClick={() => onSort('timestamp')}
            >
              <div className="flex items-center gap-1">
                Timestamp
                {sortConfig.key === 'timestamp' && (
                  sortConfig.direction === 'asc' 
                    ? <ArrowUp size={14} className="text-blue-600" /> 
                    : <ArrowDown size={14} className="text-blue-600" />
                )}
                {sortConfig.key !== 'timestamp' && (
                  <ArrowDown size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resource</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {logs.map((log) => {
            const avatarColor = getUserAvatarColor(log.userName);
            
            return (
              <tr 
                  key={log.id} 
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails(log)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionBadge action={log.action} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 border border-opacity-10 shadow-sm ${avatarColor}`}>
                      {log.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{log.userName}</div>
                      <div title={log.userEmail} className="text-xs text-slate-500 truncate max-w-[240px]">
                        {log.userEmail}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ResourceBadge resource={log.resourceType} />
                  <div className="text-xs text-slate-400 mt-1 max-w-[120px] truncate">{log.resourceName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900 max-w-xs truncate">{log.description}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{log.ipAddress}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="ghost" size="sm" className="text-slate-400 group-hover:text-blue-600">
                      View
                      <ChevronRight size={16} className="ml-1" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};