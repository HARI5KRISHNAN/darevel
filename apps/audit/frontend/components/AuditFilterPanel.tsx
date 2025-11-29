import React, { useState } from 'react';
import { ActionType, ResourceType, AuditFilters } from '../types';
import { Button } from './ui/Button';
import { Search, X, Download, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface AuditFilterPanelProps {
  filters: AuditFilters;
  onChange: (newFilters: AuditFilters) => void;
  onExport: () => void;
  isExporting: boolean;
}

export const AuditFilterPanel: React.FC<AuditFilterPanelProps> = ({ filters, onChange, onExport, isExporting }) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleInputChange = (field: keyof AuditFilters, value: any) => {
    onChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onChange({
      action: '' as any,
      resourceType: '' as any,
      search: '',
      startDate: '',
      endDate: '',
      user: '',
      resourceId: ''
    });
  };

  const activeFiltersCount = [
    filters.action, 
    filters.resourceType, 
    filters.startDate, 
    filters.endDate, 
    filters.user,
    filters.resourceId,
    filters.search
  ].filter(Boolean).length;

  const advancedFiltersCount = [
    filters.action, 
    filters.resourceType, 
    filters.startDate, 
    filters.endDate, 
    filters.user,
    filters.resourceId
  ].filter(Boolean).length;

  return (
    <div className="bg-white p-4 border-b border-slate-200 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Log</h1>
        <div className="flex items-center gap-2">
           {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
              <X size={14} className="mr-1" /> Clear Filters
            </Button>
          )}
          <Button variant="outline" onClick={onExport} isLoading={isExporting} disabled={isExporting}>
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          {/* Search Bar - Always Visible */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
              placeholder="Search description, ID, or metadata..."
              value={filters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
            />
          </div>
          
          {/* Toggle Filters Button */}
          <Button 
            variant={isFiltersOpen || advancedFiltersCount > 0 ? "secondary" : "outline"}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="whitespace-nowrap"
          >
            <Filter size={16} className="mr-2" />
            Filters
            {advancedFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center bg-slate-900 text-white text-[10px] font-bold rounded-full h-5 w-5">
                {advancedFiltersCount}
              </span>
            )}
            {isFiltersOpen ? <ChevronUp size={14} className="ml-2 text-slate-500" /> : <ChevronDown size={14} className="ml-2 text-slate-500" />}
          </Button>
        </div>

        {/* Collapsible Filters Section */}
        {isFiltersOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 transition-all ease-in-out duration-200">
            
            {/* Action Select */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase">Action</label>
              <select
                className="block w-full px-3 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white shadow-sm"
                value={filters.action || ''}
                onChange={(e) => handleInputChange('action', e.target.value)}
              >
                <option value="">All Actions</option>
                {Object.values(ActionType).map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            {/* Resource Select */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase">Resource</label>
              <select
                className="block w-full px-3 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white shadow-sm"
                value={filters.resourceType || ''}
                onChange={(e) => handleInputChange('resourceType', e.target.value)}
              >
                <option value="">All Resources</option>
                {Object.values(ResourceType).map(res => (
                  <option key={res} value={res}>{res}</option>
                ))}
              </select>
            </div>

            {/* User Search */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase">User</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                placeholder="Name or email..."
                value={filters.user || ''}
                onChange={(e) => handleInputChange('user', e.target.value)}
              />
            </div>

            {/* Resource ID */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase">Resource ID</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                placeholder="e.g. doc-123"
                value={filters.resourceId || ''}
                onChange={(e) => handleInputChange('resourceId', e.target.value)}
              />
            </div>

             {/* Date Range */}
             <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase">Date Range</label>
              <div className="flex gap-2">
                <input
                    type="date"
                    className="block w-full px-2 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-600 shadow-sm"
                    value={filters.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    placeholder="From"
                  />
                  <input
                    type="date"
                    className="block w-full px-2 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-600 shadow-sm"
                    value={filters.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    placeholder="To"
                  />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
