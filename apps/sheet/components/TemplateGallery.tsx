
import React from 'react';
import { X, FileText, User, File, Layout, FileImage, CreditCard, Calendar, LayoutTemplate } from 'lucide-react';

interface TemplateGalleryProps {
  onClose: () => void;
  onSelect: (templateTitle: string) => void;
}

const templates = [
  { id: 'blank', name: 'Blank Workbook', icon: FileText, color: 'text-slate-200', bg: 'bg-slate-700' },
  { id: 'resume', name: 'Budget Tracker', icon: User, color: 'text-blue-400', bg: 'bg-blue-900/20' },
  { id: 'letter', name: 'Invoice', icon: File, color: 'text-green-400', bg: 'bg-green-900/20' },
  { id: 'invoice', name: 'Project Planner', icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-900/20' },
  { id: 'project', name: 'Inventory List', icon: Layout, color: 'text-orange-400', bg: 'bg-orange-900/20' },
  { id: 'newsletter', name: 'Gantt Chart', icon: FileImage, color: 'text-pink-400', bg: 'bg-pink-900/20' },
  { id: 'notes', name: 'Schedule', icon: Calendar, color: 'text-red-400', bg: 'bg-red-900/20' },
  { id: 'brochure', name: 'Expense Report', icon: LayoutTemplate, color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
];

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Template Gallery</h2>
            <p className="text-sm text-slate-400">Start your workbook with a professional layout</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0f172a]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div 
                key={template.id}
                onClick={() => onSelect(template.name)}
                className="group cursor-pointer flex flex-col gap-3"
              >
                <div className={`aspect-[3/4] rounded-xl border border-slate-700 ${template.bg} relative overflow-hidden transition-all group-hover:ring-2 ring-blue-500 group-hover:shadow-xl group-hover:-translate-y-1`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <template.icon size={48} className={`${template.color} opacity-80 group-hover:scale-110 transition-transform duration-300`} strokeWidth={1.5} />
                  </div>
                  {/* Mock content lines */}
                  <div className="absolute inset-x-6 top-6 bottom-6 flex flex-col gap-3 opacity-20 pointer-events-none">
                     <div className="h-4 bg-current rounded w-3/4"></div>
                     <div className="h-2 bg-current rounded w-full"></div>
                     <div className="h-2 bg-current rounded w-5/6"></div>
                     <div className="h-2 bg-current rounded w-full"></div>
                     <div className="h-2 bg-current rounded w-4/5"></div>
                     <div className="mt-4 h-20 bg-current rounded w-full opacity-50"></div>
                  </div>
                  
                  {/* Overlay button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-lg">Use Template</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{template.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
