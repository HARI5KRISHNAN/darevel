import React, { useState, useRef, useEffect, useCallback } from 'react';
import Ribbon from './components/Ribbon';
import AIAssistant from './components/AIAssistant';
import MenuBar from './components/MenuBar';
import FileDashboard from './components/FileDashboard';
import TemplateGallery from './components/TemplateGallery';
import ContextMenu from './components/ContextMenu';
import { LeftSidebarPanel, RightSidebarPanel } from './components/SidebarPanels';
import {
  Sparkles, MessageSquare, Search, Plus,
  Menu, Moon, Sun, Play, Settings,
  PlusSquare, LayoutGrid, FileSpreadsheet,
  Database, Table, Sigma, FunctionSquare,
  ChevronDown, ArrowRight, Bold, Italic, Check,
  Share2, ChevronRight as ChevronRightIcon, LogOut, Mail, User
} from 'lucide-react';
import { DocumentState, LeftPanelType, RightPanelType, Sheet, Cell } from './types';
import sheetApi, { SheetRecord } from './src/services/api';
import { useAuth } from './src/contexts/AuthContext';

// Custom Geometric Logo Component
const DarevelLogo = () => (
  <svg width="42" height="42" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform hover:scale-105">
    <path d="M4 4H20V20Z" fill="#2563EB"/> 
    <path d="M20 4H24C32.8 4 40 11.2 40 20H20V4Z" fill="#DC2626"/> 
    <path d="M20 20H40C40 28.8 32.8 36 24 36H20V20Z" fill="#EAB308"/> 
    <path d="M4 20H20V36H4V20Z" fill="#16A34A"/> 
  </svg>
);

const App: React.FC = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // GRID GENERATION CONSTANTS
  const COLS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  const ROWS = Array.from({length: 40}, (_, i) => i + 1);

  const columnIndexToLetters = useCallback((index: number) => {
    let result = '';
    let current = index;
    while (current >= 0) {
      result = String.fromCharCode((current % 26) + 65) + result;
      current = Math.floor(current / 26) - 1;
    }
    return result;
  }, []);

  const lettersToColumnIndex = useCallback((letters: string) => {
    return letters
      .toUpperCase()
      .split('')
      .reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;
  }, []);

  const parseCellId = useCallback((cellId: string) => {
    const match = cellId.match(/([A-Z]+)(\d+)/i);
    if (!match) return null;
    const [, letters, row] = match;
    return {
      rowIndex: Math.max(0, parseInt(row, 10) - 1),
      colIndex: Math.max(0, lettersToColumnIndex(letters))
    };
  }, [lettersToColumnIndex]);

  const legacyGridToMap = useCallback((grid: unknown): Record<string, Cell> => {
    const map: Record<string, Cell> = {};
    if (!Array.isArray(grid)) {
      return map;
    }

    grid.forEach((row, rowIdx) => {
      if (!Array.isArray(row) || rowIdx >= ROWS.length) return;
      row.forEach((cell: any, colIdx: number) => {
        if (colIdx >= COLS.length) return;
        const cellId = `${columnIndexToLetters(colIdx)}${rowIdx + 1}`;
        const value = typeof cell === 'object' && cell !== null ? (cell.value ?? '') : (cell ?? '');
        const formula = typeof cell === 'object' && cell !== null ? cell.formula : undefined;
        if (value || formula) {
          map[cellId] = { id: cellId, value, formula };
        }
      });
    });
    return map;
  }, [COLS.length, ROWS.length, columnIndexToLetters]);

  const mapToLegacyGrid = useCallback((data: Record<string, Cell>) => {
    const grid = Array.from({ length: ROWS.length }, () =>
      Array.from({ length: COLS.length }, () => ({ value: '' }))
    );

    Object.entries(data).forEach(([cellId, cell]) => {
      const parsed = parseCellId(cellId);
      if (!parsed) return;
      const { rowIndex, colIndex } = parsed;
      if (rowIndex >= ROWS.length || colIndex >= COLS.length) return;
      grid[rowIndex][colIndex] = {
        value: cell.value || '',
        formula: cell.formula
      };
    });

    return grid;
  }, [COLS.length, ROWS.length, parseCellId]);

  // --- SHEETS STATE ---
  const [sheets, setSheets] = useState<Sheet[]>([
    { id: 'sheet1', name: 'Sheet1', data: {} }
  ]);
  const [activeSheetId, setActiveSheetId] = useState('sheet1');
  const [activeCell, setActiveCell] = useState<string | null>('A1');
  const [formulaBarValue, setFormulaBarValue] = useState('');
  
  const [docState, setDocState] = useState<DocumentState>({
    title: "Darevel Sheets",
    lastSaved: new Date(),
    activeSheetId: 'sheet1',
    activeCell: 'A1',
    selectionRange: null
  });

  const [savedSheets, setSavedSheets] = useState<SheetRecord[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [currentSheetRemoteId, setCurrentSheetRemoteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Ribbon State
  const [activeRibbonTab, setActiveRibbonTab] = useState('Home');
  const [showTemplates, setShowTemplates] = useState(false);

  // Sidebar States
  const [activeLeftPanel, setActiveLeftPanel] = useState<LeftPanelType>(LeftPanelType.FUNCTIONS);
  const [activeRightPanel, setActiveRightPanel] = useState<RightPanelType>(RightPanelType.NONE);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number }>({ show: false, x: 0, y: 0 });
  
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const getActiveSheet = () => sheets.find(s => s.id === activeSheetId) || sheets[0];

  // Sync Formula Bar with Active Cell
  useEffect(() => {
    if (activeCell) {
      const sheet = getActiveSheet();
      const cellData = sheet.data[activeCell];
      setFormulaBarValue(cellData?.value || '');
    }
  }, [activeCell, activeSheetId, sheets]);

  const handleCellChange = (cellId: string, value: string) => {
    setSheets(prev => prev.map(sheet => {
      if (sheet.id === activeSheetId) {
        return {
          ...sheet,
          data: {
            ...sheet.data,
            [cellId]: { ...sheet.data[cellId], id: cellId, value }
          }
        };
      }
      return sheet;
    }));
    setFormulaBarValue(value);
  };

  const handleFormat = (command: string, value?: string) => {
    if (command === 'newTemplate') { setShowTemplates(true); return; }
    // Implement format logic for active cell...
  };

  const handleTemplateSelect = (template: string) => {
    setShowTemplates(false);
    setDocState(prev => ({...prev, title: template}));
  };

  const refreshSheetLibrary = useCallback(async () => {
    try {
      setIsLibraryLoading(true);
      const list = await sheetApi.list();
      setSavedSheets(list);
      setError(null);
    } catch (err) {
      console.error('Failed to load sheets', err);
      setError('Unable to load sheets from backend');
    } finally {
      setIsLibraryLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSheetLibrary();
  }, [refreshSheetLibrary]);

  useEffect(() => {
    if (activeRibbonTab === 'File') {
      refreshSheetLibrary();
    }
  }, [activeRibbonTab, refreshSheetLibrary]);

  const handleCreateSheet = () => {
    const id = `sheet-${Date.now()}`;
    setSheets([{ id, name: 'Untitled Sheet', data: {} }]);
    setActiveSheetId(id);
    setActiveCell('A1');
    setCurrentSheetRemoteId(null);
    setDocState(prev => ({
      ...prev,
      title: 'Untitled Sheet',
      activeSheetId: id,
      activeCell: 'A1',
      lastSaved: new Date()
    }));
    setActiveRibbonTab('Home');
  };

  const handleOpenSheet = async (recordId: number) => {
    try {
      setIsPersisting(true);
      const record = await sheetApi.get(recordId);
      const parsed = JSON.parse(record.data || '[]');
      const map = legacyGridToMap(parsed);
      const newId = `sheet-${record.id}`;
      setSheets([{ id: newId, name: record.name, data: map, remoteId: record.id }]);
      setActiveSheetId(newId);
      setActiveCell('A1');
      setCurrentSheetRemoteId(record.id);
      setDocState(prev => ({
        ...prev,
        title: record.name,
        activeSheetId: newId,
        activeCell: 'A1',
        lastSaved: record.lastSavedAt ? new Date(record.lastSavedAt) : new Date()
      }));
      setActiveRibbonTab('Home');
      setError(null);
    } catch (err) {
      console.error('Failed to open sheet', err);
      setError('Failed to open sheet');
    } finally {
      setIsPersisting(false);
    }
  };

  const handleDeleteSheet = async (recordId: number) => {
    if (!window.confirm('Delete this sheet permanently?')) {
      return;
    }
    try {
      await sheetApi.remove(recordId);
      if (currentSheetRemoteId === recordId) {
        handleCreateSheet();
      }
      await refreshSheetLibrary();
    } catch (err) {
      console.error('Failed to delete sheet', err);
      setError('Failed to delete sheet');
    }
  };

  const handleSaveSheet = async () => {
    const activeSheet = getActiveSheet();
    if (!activeSheet) return;

    const payloadName = docState.title || activeSheet.name;
    const serializedData = JSON.stringify(mapToLegacyGrid(activeSheet.data));

    try {
      setIsPersisting(true);
      const payload = { name: payloadName, data: serializedData, merges: JSON.stringify([]) };
      let record: SheetRecord;
      if (currentSheetRemoteId) {
        record = await sheetApi.update(currentSheetRemoteId, payload);
      } else {
        record = await sheetApi.create(payload);
      }

      setCurrentSheetRemoteId(record.id);
      setSheets(prev => prev.map(sheet => sheet.id === activeSheetId ? { ...sheet, name: record.name, remoteId: record.id } : sheet));
      setDocState(prev => ({
        ...prev,
        title: record.name,
        lastSaved: record.lastSavedAt ? new Date(record.lastSavedAt) : new Date()
      }));
      setStatusMessage('All changes saved');
      await refreshSheetLibrary();
      setError(null);
    } catch (err) {
      console.error('Failed to save sheet', err);
      setError('Failed to save sheet');
    } finally {
      setIsPersisting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Basic implementation for movement could go here
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (activeRibbonTab === 'File') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        {showTemplates && <TemplateGallery onClose={() => setShowTemplates(false)} onSelect={handleTemplateSelect} />}
        <FileDashboard 
          onBack={() => setActiveRibbonTab('Home')} 
          onOpenTemplates={() => setShowTemplates(true)}
          sheets={savedSheets}
          isLoading={isLibraryLoading}
          onOpenSheet={handleOpenSheet}
          onCreateSheet={handleCreateSheet}
          onDeleteSheet={handleDeleteSheet}
          onRefresh={refreshSheetLibrary}
        />
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/10 border border-red-400 text-red-600 px-4 py-2 rounded-xl flex items-center gap-4 shadow-lg">
          <span>{error}</span>
          <button className="text-sm underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-300 overflow-hidden font-sans transition-colors duration-200">
        
        {showTemplates && <TemplateGallery onClose={() => setShowTemplates(false)} onSelect={handleTemplateSelect} />}
        
        {contextMenu.show && (
          <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            onClose={() => setContextMenu({...contextMenu, show: false})} 
            onFormat={(cmd, val) => { handleFormat(cmd, val); setContextMenu({...contextMenu, show: false}); }} 
          />
        )}

        {/* 1. LEFT NAVIGATION STRIP */}
        <div className="w-[68px] bg-slate-50 dark:bg-[#0f172a] flex flex-col items-center py-6 z-50 flex-shrink-0 h-full border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <div className="mb-8"><button className="flex items-center justify-center"><DarevelLogo /></button></div>
          <div className="flex flex-col items-center flex-1 w-full overflow-y-auto gap-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
             <SidebarIcon icon={FileSpreadsheet} type={LeftPanelType.FUNCTIONS} activeType={activeLeftPanel} onClick={setActiveLeftPanel} />
             <SidebarIcon icon={PlusSquare} type={LeftPanelType.INSERT} activeType={activeLeftPanel} onClick={setActiveLeftPanel} />
             <SidebarIcon icon={Search} type={LeftPanelType.SEARCH} activeType={activeLeftPanel} onClick={setActiveLeftPanel} />
             <SidebarIcon icon={Sparkles} type={LeftPanelType.AI} activeType={activeLeftPanel} onClick={setActiveLeftPanel} />
             <SidebarIcon icon={Database} type={LeftPanelType.DATA} activeType={activeLeftPanel} onClick={setActiveLeftPanel} />
             <SidebarIcon icon={LayoutGrid} type={LeftPanelType.SNIPPETS} activeType={activeLeftPanel} onClick={setActiveLeftPanel} />
          </div>
          <div className="mt-auto flex flex-col items-center gap-6 pb-4">
              <button onClick={toggleTheme} className="p-3 text-slate-500 dark:text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800 transition-all">
                 {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </button>
          </div>
        </div>

        {/* 2. EXPANDABLE LEFT PANEL */}
        {activeLeftPanel !== LeftPanelType.NONE && (
          <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col shadow-2xl relative z-40">
            {activeLeftPanel === LeftPanelType.AI ? (
              <AIAssistant 
                documentContext={""}
                selectedText={activeCell ? getActiveSheet().data[activeCell]?.value : ""}
                onInsert={(text) => handleFormat('insertText', text)}
              />
            ) : (
              <LeftSidebarPanel type={activeLeftPanel} onClose={() => setActiveLeftPanel(LeftPanelType.NONE)} />
            )}
          </div>
        )}

        {/* 3. MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#e5e5e5] dark:bg-[#18181b] relative transition-colors duration-200">
          
          {/* Header */}
          <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-[#0f172a] z-30">
            <div className="flex items-center gap-4">
               <h1 className="text-lg font-normal text-slate-700 dark:text-slate-200 flex items-center gap-2">
                 <FileSpreadsheet className="text-green-500" size={20} />
                 <span className="font-semibold text-black dark:text-white">{docState.title}</span>
               </h1>
               <div className="text-xs text-slate-500 dark:text-slate-400">
                 {statusMessage || `Last saved ${docState.lastSaved?.toLocaleString()}`}
               </div>
            </div>
            <div className="flex items-center gap-2">
               <button
                 onClick={handleSaveSheet}
                 className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg disabled:opacity-60"
                 disabled={isPersisting}
               >
                  {isPersisting ? 'Saving…' : 'Save'}
               </button>
               <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg">
                  <Share2 size={16} /> Share
               </button>

               {/* User Profile Dropdown */}
               <div className="relative ml-2">
                 <button
                   onClick={() => setShowProfileMenu(!showProfileMenu)}
                   className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-green-300 transition-all"
                 >
                   {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                 </button>

                 {showProfileMenu && (
                   <>
                     <div
                       className="fixed inset-0 z-40"
                       onClick={() => setShowProfileMenu(false)}
                     />
                     <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                       <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
                         <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl font-bold text-white">
                             {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="font-semibold text-slate-900 dark:text-white truncate">
                               {user?.name || user?.username || 'User'}
                             </div>
                             <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
                               {user?.email || 'No email'}
                             </div>
                           </div>
                         </div>
                       </div>
                       <div className="p-2">
                         <button
                           onClick={logout}
                           className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                         >
                           <LogOut size={18} />
                           <span className="font-medium">Sign out</span>
                         </button>
                       </div>
                     </div>
                   </>
                 )}
               </div>
            </div>
          </header>

          {/* Ribbon */}
          <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] z-20">
             <div className="flex items-center justify-between px-2 pt-2 border-b border-slate-200 dark:border-slate-800">
               <div className="flex-1"><MenuBar activeTab={activeRibbonTab} onTabChange={setActiveRibbonTab} /></div>
             </div>
             <Ribbon activeTab={activeRibbonTab} onFormat={handleFormat} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
          </div>

          {/* FORMULA BAR (Enhanced UI) */}
          <div className="h-12 bg-white dark:bg-[#0b1320] border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3 z-20 text-sm shadow-sm relative">
             <div className="w-24 h-8 bg-slate-100 dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-md px-3 flex items-center justify-center font-bold font-mono text-slate-600 dark:text-slate-300 shadow-inner">
                {activeCell || ''}
             </div>
             <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-red-500"><Plus size={14} className="rotate-45" /></button>
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-green-500"><Check size={14} /></button>
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500"><FunctionSquare size={14} /></button>
             </div>
             <div className="flex-1 h-8 bg-slate-50 dark:bg-[#151e32] border border-slate-200 dark:border-slate-700/50 rounded-md flex items-center relative group focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                <div className="px-3 text-slate-400 dark:text-slate-500 font-serif italic font-bold">fx</div>
                <input 
                  value={formulaBarValue}
                  onChange={(e) => {
                     setFormulaBarValue(e.target.value);
                     if(activeCell) handleCellChange(activeCell, e.target.value);
                  }}
                  className="flex-1 bg-transparent outline-none text-slate-800 dark:text-slate-200 px-1 font-mono text-sm h-full w-full"
                  placeholder="Enter formula or value"
                />
             </div>
             <button className="text-slate-400 hover:text-white transition-colors"><ChevronDown size={14} /></button>
          </div>

          {/* SPREADSHEET GRID */}
          <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#18181b] relative custom-scrollbar">
             <table className="border-collapse w-max">
                <thead>
                   <tr>
                      <th className="w-10 bg-slate-100 dark:bg-[#0f172a] border-r border-b border-slate-300 dark:border-slate-700 sticky top-0 left-0 z-20">
                         <div className="absolute bottom-0 right-0 w-3 h-3 border-t border-l border-slate-400/30"></div>
                      </th>
                      {COLS.map(col => (
                         <th key={col} className="w-24 h-8 bg-slate-100 dark:bg-[#0f172a] border-r border-b border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 sticky top-0 z-10 select-none hover:bg-slate-200 dark:hover:bg-[#1e293b] transition-colors cursor-pointer">
                            {col}
                         </th>
                      ))}
                   </tr>
                </thead>
                <tbody>
                   {ROWS.map(row => (
                      <tr key={row}>
                         <td className="h-6 bg-slate-100 dark:bg-[#0f172a] border-r border-b border-slate-300 dark:border-slate-700 text-xs text-center text-slate-500 dark:text-slate-400 sticky left-0 z-10 select-none hover:bg-slate-200 dark:hover:bg-[#1e293b] transition-colors cursor-pointer">
                            {row}
                         </td>
                         {COLS.map(col => {
                            const cellId = `${col}${row}`;
                            const isActive = activeCell === cellId;
                            const cellData = getActiveSheet().data[cellId];
                            return (
                               <td 
                                 key={cellId}
                                 onClick={() => setActiveCell(cellId)}
                                 className={`
                                   border-r border-b border-slate-300 dark:border-slate-700 p-0 relative min-w-[96px] h-6
                                   ${isActive ? 'z-10' : ''}
                                 `}
                               >
                                  {isActive && (
                                     <div className="absolute inset-0 border-2 border-green-500 pointer-events-none shadow-[0_0_0_1px_rgba(22,163,74,0.3)]">
                                        <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-green-500 border border-white dark:border-[#18181b] cursor-crosshair"></div>
                                     </div>
                                  )}
                                  <input 
                                    className="w-full h-full bg-transparent px-1 text-xs text-slate-800 dark:text-slate-300 outline-none cursor-cell focus:cursor-text"
                                    value={cellData?.value || ''}
                                    onChange={(e) => handleCellChange(cellId, e.target.value)}
                                  />
                               </td>
                            );
                         })}
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

          {/* SHEET TABS (Footer) - Enhanced */}
          <footer className="h-10 bg-slate-100 dark:bg-[#0b1320] border-t border-slate-300 dark:border-slate-800 flex items-center px-2 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
             <div className="flex items-center gap-2 h-full mr-4 border-r border-slate-300 dark:border-slate-700 pr-2">
               <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"><Plus size={18} /></button>
               <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"><Menu size={18} /></button>
             </div>
             <div className="flex items-end h-full overflow-x-auto gap-1">
                {sheets.map(sheet => (
                   <button 
                     key={sheet.id}
                     onClick={() => setActiveSheetId(sheet.id)}
                     className={`
                       px-6 py-1.5 text-xs font-semibold rounded-t-lg min-w-[120px] text-center transition-all relative top-[1px]
                       ${activeSheetId === sheet.id 
                         ? 'bg-slate-50 dark:bg-[#18181b] text-green-600 dark:text-green-400 border-t-2 border-x border-slate-300 dark:border-slate-700 border-t-green-500 shadow-sm' 
                         : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                       }
                     `}
                   >
                      {sheet.name}
                   </button>
                ))}
                <button className="px-3 text-slate-400 hover:text-green-500 transition-colors"><Plus size={14} /></button>
             </div>
             <div className="ml-auto flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 px-4">
                <span>Ready</span>
                <span>Num Lock</span>
                <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="w-2/3 h-full bg-blue-500 rounded-full"></div>
                </div>
                <span>100%</span>
             </div>
          </footer>

        </div>
      </div>
    </div>
  );
};

const SidebarIcon = ({ icon: Icon, type, activeType, onClick }: any) => {
  const isActive = activeType === type;
  return (
    <div className="w-full flex items-center justify-center">
      <button 
        onClick={() => onClick(isActive ? LeftPanelType.NONE : type)}
        className={`p-3 rounded-xl transition-all ${isActive ? 'bg-white text-green-600 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
      >
        <Icon size={20} />
      </button>
    </div>
  );
};

export default App;