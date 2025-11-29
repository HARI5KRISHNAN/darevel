import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { FileList } from './components/FileList';
import { FileDetails } from './components/FileDetails';
import { getFiles, getFolder, searchFiles } from './services/storageService';
import { FileItem, Breadcrumb, ViewMode } from './types';
import {
    LayoutGrid, List as ListIcon, ChevronRight, Home, UploadCloud,
    Trash2, Share2, Move, Star, Download, MoreHorizontal
} from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('drive');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: 'root', name: 'My Drive' }]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    if (activeSection === 'drive') {
      const data = await getFiles(currentFolderId);
      setFiles(data);
    } else {
        const data = await getFiles(null);
        setFiles(data);
    }
    setLoading(false);
  }, [currentFolderId, activeSection]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleNavigate = async (folderId: string) => {
    setCurrentFolderId(folderId);
    const folder = await getFolder(folderId);
    if (folder) {
      setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    }
    setSelectedFile(null);
    setDetailsOpen(false);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setCurrentFolderId(null);
      setBreadcrumbs([{ id: 'root', name: 'My Drive' }]);
    } else {
      const target = breadcrumbs[index];
      if (target.id === 'root') {
          setCurrentFolderId(null);
          setBreadcrumbs([{id: 'root', name: 'My Drive'}]);
      } else {
          setBreadcrumbs(prev => prev.slice(0, index + 1));
          setCurrentFolderId(target.id);
      }
    }
    setSelectedFile(null);
  };

  const handleSearch = async (query: string) => {
      if (!query) {
          loadFiles();
          return;
      }
      setLoading(true);
      const results = await searchFiles(query);
      setFiles(results);
      setLoading(false);
  };

  const handleFileSelect = (file: FileItem) => {
      // Toggle selection if clicking same file, otherwise select new
      if (selectedFile?.id === file.id) {
          // If detailed view is closed, open it. If open, keep selected.
          // To deselect, user might click outside (not implemented in this simplified view)
          setDetailsOpen(true);
      } else {
          setSelectedFile(file);
          setDetailsOpen(true);
      }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={(s) => {
          setActiveSection(s);
          if (s === 'drive') {
              setCurrentFolderId(null);
              setBreadcrumbs([{id: 'root', name: 'My Drive'}]);
          }
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar
          onSearch={handleSearch}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 flex overflow-hidden relative">

            {/* --- MAIN CONTENT AREA --- */}
            <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-800 sm:mr-4 sm:my-4 sm:rounded-3xl sm:shadow-lg sm:border sm:border-slate-200/60 dark:border-slate-700 overflow-hidden transition-all duration-300 ${detailsOpen ? 'sm:mr-0 sm:rounded-r-none border-r-0' : ''}`}>

                {/* TOOLBAR / HEADER */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 z-10 min-h-[72px]">

                    {/* Contextual Action Bar (Active when file selected) */}
                    {selectedFile ? (
                        <div className="flex-1 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                             <div className="flex items-center space-x-2">
                                <button onClick={() => { setSelectedFile(null); setDetailsOpen(false); }} className="text-slate-400 hover:text-slate-600 mr-2">
                                    <span className="sr-only">Close selection</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{1} Selected</span>
                             </div>

                             <div className="flex items-center space-x-1 sm:space-x-2">
                                 <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Share">
                                     <Share2 className="h-4.5 w-4.5" />
                                 </button>
                                 <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Download">
                                     <Download className="h-4.5 w-4.5" />
                                 </button>
                                 <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Move">
                                     <Move className="h-4.5 w-4.5" />
                                 </button>
                                 <button className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors" title="Add to Starred">
                                     <Star className="h-4.5 w-4.5" />
                                 </button>
                                 <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                                 <button className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                                     <Trash2 className="h-4.5 w-4.5" />
                                 </button>
                                 <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                     <MoreHorizontal className="h-4.5 w-4.5" />
                                 </button>
                             </div>
                        </div>
                    ) : (
                        /* Default Toolbar */
                        <>
                            <div className="flex items-center space-x-1 overflow-hidden">
                                {breadcrumbs.map((crumb, index) => (
                                    <div key={crumb.id} className="flex items-center">
                                        {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1 flex-shrink-0" />}
                                        <button
                                            onClick={() => handleBreadcrumbClick(index)}
                                            className={`flex items-center text-sm font-medium truncate max-w-[100px] sm:max-w-[150px] transition-colors ${index === breadcrumbs.length - 1 ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-700 px-1.5 py-0.5 rounded-md'}`}
                                        >
                                            {index === 0 && <Home className="h-4 w-4 mr-1.5" />}
                                            {crumb.name}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                                <div className="hidden sm:flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg items-center">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                    >
                                        <ListIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* FILE LIST SCROLL AREA */}
                <div
                    className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-800 scroll-smooth custom-scrollbar"
                    onClick={() => {
                        // Optional: Click background to deselect
                        // setSelectedFile(null);
                        // setDetailsOpen(false);
                    }}
                >
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-blue-500"></div>
                                <span className="text-sm font-medium text-slate-400">Loading your content...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="pb-24">
                            {!selectedFile && (
                                <div className="mb-6 flex items-end justify-between">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                        {breadcrumbs[breadcrumbs.length - 1].name}
                                    </h2>
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                        {files.length} items
                                    </span>
                                </div>
                            )}
                            <FileList
                                files={files}
                                viewMode={viewMode}
                                onNavigate={handleNavigate}
                                onSelect={handleFileSelect}
                                selectedFileId={selectedFile?.id || null}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* DETAILS SIDEBAR (Smart Preview Pane) */}
            {detailsOpen && (
                <div className="absolute inset-y-0 right-0 w-80 sm:w-80 border-l border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl z-30 sm:relative sm:shadow-none sm:z-0 transition-transform duration-300 transform sm:my-4 sm:mr-4 sm:rounded-r-3xl sm:border-y sm:border-r border-slate-200/60 overflow-hidden">
                    <FileDetails file={selectedFile} onClose={() => setDetailsOpen(false)} />
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default App;
