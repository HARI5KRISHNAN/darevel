import React from 'react';
import { AlertCircle, Download, Sparkles, Lock, Clock, CheckCircle, X, RefreshCcw } from 'lucide-react';
import { FileMetadata, PreviewStatus } from '../types';

interface PreviewToolbarProps {
  file?: FileMetadata | null;
  onClose: () => void;
  onToggleAI: () => void;
  isAIEnabled: boolean;
  isLoading: boolean;
}

const statusBadgeStyles: Record<PreviewStatus, string> = {
  [PreviewStatus.READY]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  [PreviewStatus.PROCESSING]: 'bg-amber-50 text-amber-600 border-amber-100',
  [PreviewStatus.FAILED]: 'bg-rose-50 text-rose-600 border-rose-100',
};

const PreviewToolbar: React.FC<PreviewToolbarProps> = ({ file, onClose, onToggleAI, isAIEnabled, isLoading }) => {
  return (
    <div className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <X size={18} />
        </button>
        <div>
          <p className="text-sm text-slate-500">File Preview</p>
          <h2 className="text-lg font-semibold text-slate-800">
            {isLoading ? 'Loading...' : file?.name || 'Unknown file'}
          </h2>
        </div>
        {file && (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusBadgeStyles[file.status]}`}>
            {file.status}
          </span>
        )}
        {file?.status === PreviewStatus.PROCESSING && (
          <span className="flex items-center text-xs text-amber-600">
            <RefreshCcw size={14} className="mr-1 animate-spin" /> Generating preview
          </span>
        )}
        {file?.status === PreviewStatus.FAILED && (
          <span className="flex items-center text-xs text-rose-600">
            <AlertCircle size={14} className="mr-1" /> Preview failed
          </span>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300">
          <Download size={16} />
          <span>Download</span>
        </button>
        <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-medium ${isAIEnabled ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`} onClick={onToggleAI}>
          <Sparkles size={16} />
          <span>{isAIEnabled ? 'Hide AI' : 'AI Insights'}</span>
        </button>
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <Lock size={12} />
            <span>Secured</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock size={12} />
            <span>Updated {file?.updatedAt || '--'}</span>
          </span>
          <span className="flex items-center space-x-1">
            <CheckCircle size={12} />
            <span>Virus scanned</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PreviewToolbar;
