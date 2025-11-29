import React, { useEffect, useRef } from 'react';
import { AuditLog } from '../types';
import { X, Clock, User, Globe, FileText, Database, Network } from 'lucide-react';
import { ActionBadge } from './Badges';

interface AuditDetailsDrawerProps {
  log: AuditLog | null;
  onClose: () => void;
}

export const AuditDetailsDrawer: React.FC<AuditDetailsDrawerProps> = ({ log, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!log) return null;

  return (
    <div className="relative z-50" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Background backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform transition ease-in-out duration-500 sm:duration-700 bg-white shadow-xl flex flex-col h-full">
              
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-6 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900" id="slide-over-title">
                    Audit Log Details
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">ID: <span className="font-mono text-xs bg-slate-200 px-1 py-0.5 rounded">{log.id}</span></p>
                </div>
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    className="relative rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                
                {/* Main Event Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Event</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-900">Action</span>
                                <ActionBadge action={log.action} />
                             </div>
                             <p className="text-sm text-slate-700 leading-relaxed">{log.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Clock className="text-slate-400" size={18} />
                            <div>
                                <p className="text-xs text-slate-500">Timestamp</p>
                                <p className="text-sm font-medium text-slate-900">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Actor Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Actor</h3>
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                            {log.userName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900">{log.userName}</p>
                            <p className="text-sm text-slate-500">{log.userEmail}</p>
                            <p className="text-xs text-slate-400 mt-1">ID: {log.userId}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center gap-3">
                            <Globe className="text-slate-400" size={18} />
                            <div>
                                <p className="text-xs text-slate-500">IP Address</p>
                                <p className="text-sm font-medium text-slate-900">{log.ipAddress}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Network className="text-slate-400" size={18} />
                            <div>
                                <p className="text-xs text-slate-500">MAC Address</p>
                                <p className="text-sm font-medium text-slate-900 font-mono">{log.macAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                 {/* Resource Info */}
                 <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Resource</h3>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-xs text-slate-500">Type</p>
                            <p className="text-sm font-medium text-slate-900">{log.resourceType}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Name</p>
                            <p className="text-sm font-medium text-slate-900 truncate">{log.resourceName}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-slate-500">Resource ID</p>
                            <p className="text-sm font-mono text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-100">{log.resourceId}</p>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Metadata */}
                {log.metadata && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Database className="text-slate-400" size={16} />
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Metadata</h3>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-xs text-green-400 font-mono leading-relaxed">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

              </div>
              
              {/* Footer */}
              <div className="flex-shrink-0 border-t border-slate-200 px-4 py-4 sm:px-6 bg-slate-50 flex justify-end">
                <button
                  type="button"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};