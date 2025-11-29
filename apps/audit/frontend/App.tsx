import React, { useState, useEffect, useCallback } from 'react';
import { AuditFilterPanel } from './components/AuditFilterPanel';
import { AuditLogTable } from './components/AuditLogTable';
import { AuditDetailsDrawer } from './components/AuditDetailsDrawer';
import { Button } from './components/ui/Button';
import { fetchAuditLogs, exportAuditLogsToCSV } from './services/auditService';
import { AuditLog, AuditFilters, PaginationMeta, SortConfig } from './types';
import { ChevronLeft, ChevronRight, Lock, Shield } from 'lucide-react';

const PAGE_SIZE = 10;

export default function App() {
  // Application State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(true); // Toggle for demo purposes

  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, size: PAGE_SIZE, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<AuditFilters>({
    search: '',
    startDate: '',
    endDate: '',
    action: '' as any,
    resourceType: '' as any,
    user: '',
    resourceId: ''
  });
  // Sorting State
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'desc' });

  // Selected Item for Drawer
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Data Fetching
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAuditLogs(page, PAGE_SIZE, filters, sortConfig, isAdmin);
      setLogs(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      if (err.message === '403_FORBIDDEN') {
        setError("You do not have permission to view audit logs.");
      } else {
        setError("Failed to load audit logs. Please try again.");
      }
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters, sortConfig, isAdmin]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Handlers
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAuditLogsToCSV(filters, sortConfig, isAdmin);
    } catch (e) {
      alert("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = (newFilters: AuditFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleSort = (key: keyof AuditLog) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
    setPage(1); // Reset to page 1 when sorting changes to see top results
  };

  // 403 / No Permission View
  if (error === "You do not have permission to view audit logs.") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-red-100">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">You do not have the required permissions (Workspace Admin) to view these audit logs.</p>
          <Button onClick={() => setIsAdmin(true)}>Switch to Admin User (Demo)</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar Simulation */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Shield className="text-blue-400" />
          <span>Darevel Admin <span className="text-slate-400 font-normal">Console</span></span>
        </div>
        <div className="flex items-center gap-4">
             {/* Admin Toggle for Demo */}
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white">
                <input 
                    type="checkbox" 
                    checked={isAdmin} 
                    onChange={(e) => setIsAdmin(e.target.checked)} 
                    className="rounded border-slate-700 bg-slate-800"
                />
                Is Admin?
            </label>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                AD
            </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Card */}
        <div className="bg-white shadow-sm ring-1 ring-slate-900/5 rounded-xl overflow-hidden">
          
          <AuditFilterPanel 
            filters={filters} 
            onChange={handleFilterChange} 
            onExport={handleExport}
            isExporting={isExporting}
          />

          <AuditLogTable 
            logs={logs} 
            isLoading={isLoading} 
            onViewDetails={setSelectedLog}
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          {/* Pagination Footer */}
          {!isLoading && logs.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
              <div className="hidden sm:flex flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Showing <span className="font-medium">{(meta.page - 1) * meta.size + 1}</span> to <span className="font-medium">{Math.min(meta.page * meta.size, meta.total)}</span> of <span className="font-medium">{meta.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {/* Simple Page Indicator */}
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-offset-0 bg-white">
                        Page {page} of {meta.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                      disabled={page === meta.totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <AuditDetailsDrawer 
        log={selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />
    </div>
  );
}