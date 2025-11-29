import React, { useState } from 'react';
import { FileText, FileSpreadsheet, FileImage, Film, Presentation, File, Search, Grid, List, Clock, Star, Cloud } from 'lucide-react';
import FilePreviewModal from './components/FilePreviewModal';
import { MOCK_FILES } from './services/mockData';
import { FileMetadata, FileType } from './types';

const App: React.FC = () => {
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case FileType.PDF:
        return <FileText className="text-red-500" />;
      case FileType.DOCX:
        return <FileText className="text-blue-500" />;
      case FileType.XLSX:
        return <FileSpreadsheet className="text-green-500" />;
      case FileType.PPTX:
        return <Presentation className="text-orange-500" />;
      case FileType.IMAGE:
        return <FileImage className="text-purple-500" />;
      case FileType.VIDEO:
        return <Film className="text-pink-500" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: FileType) => {
    switch (type) {
      case FileType.DOCX:
        return 'Word Document';
      case FileType.PPTX:
        return 'PowerPoint';
      case FileType.XLSX:
        return 'Excel Sheet';
      case FileType.IMAGE:
        return 'Image File';
      case FileType.VIDEO:
        return 'Video File';
      default:
        return type;
    }
  };

  const renderCard = (file: FileMetadata) => (
    <div
      key={file.id}
      onClick={() => setActiveFileId(file.id)}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
          {getFileIcon(file.type)}
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
            file.status === 'READY'
              ? 'bg-green-100 text-green-700'
              : file.status === 'PROCESSING'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
          }`}
        >
          {file.status}
        </span>
      </div>

      <h3 className="font-medium text-slate-800 truncate mb-1" title={file.name}>
        {file.name}
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        {getTypeLabel(file.type)} • {file.size}
      </p>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span>{file.updatedAt}</span>
        <span>{file.owner}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center space-x-2 text-indigo-700 font-bold text-xl">
          <Cloud size={28} />
          <span>CloudDrive</span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <a href="#" className="flex items-center space-x-3 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg font-medium">
            <Grid size={18} />
            <span>My Files</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium transition-colors">
            <Clock size={18} />
            <span>Recent</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium transition-colors">
            <Star size={18} />
            <span>Starred</span>
          </a>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-100 rounded-full h-2 w-full overflow-hidden">
            <div className="bg-indigo-500 w-3/4 h-full"></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">75 GB of 100 GB used</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg text-sm transition-all outline-none"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <List size={20} />
            </button>
            <button className="p-2 text-slate-600 bg-slate-100 rounded">
              <Grid size={20} />
            </button>
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">JS</div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Recent Files</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MOCK_FILES.map(renderCard)}
          </div>
        </main>
      </div>

      {activeFileId && <FilePreviewModal fileId={activeFileId} onClose={() => setActiveFileId(null)} />}
    </div>
  );
};

export default App;
