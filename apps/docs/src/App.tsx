import React, { useState, useRef, useEffect } from 'react';
import Ribbon from './components/Ribbon';
import AIAssistant from './components/AIAssistant';
import MenuBar from './components/MenuBar';
import FileDashboard from './components/FileDashboard';
import TemplateGallery from './components/TemplateGallery';
import ContextMenu from './components/ContextMenu';
import { LeftSidebarPanel, RightSidebarPanel } from './components/SidebarPanels';
import {
  Sparkles, MessageSquare, MoreHorizontal, Search, User, FileText, Lock, Activity, Plus, Menu,
  MessageCircle, AlignJustify, Image as ImageIcon, Layers, BarChart2, Users, Settings, History,
  Command, Moon, Sun, LogOut, Mail
} from 'lucide-react';
import { DocumentState, LeftPanelType, RightPanelType } from './types';
import { documentAPI } from './services/api';
import { useAuth } from './contexts/AuthContext';

// Custom Geometric Logo Component
const DarevelLogo = () => (
  <svg width="42" height="42" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform hover:scale-105">
    <path d="M4 4H20C28.8366 4 36 11.1634 36 20C36 20.6554 35.9609 21.2995 35.8853 21.9312L20 20L4 4Z" fill="#DC2626"/> {/* Red Top Arch */}
    <path d="M20 20L36 20V20C36 28.8366 28.8366 36 20 36V20Z" fill="#EAB308"/> {/* Yellow Bottom Curve */}
    <rect x="4" y="20" width="16" height="16" fill="#16A34A"/> {/* Green Bottom Square */}
    <path d="M4 4L20 20H4V4Z" fill="#2563EB"/> {/* Blue Top Triangle */}
  </svg>
);

const App: React.FC = () => {
  // Auth context
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Backend integration state
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [orgId] = useState<string>('default-org');
  const [isLoading, setIsLoading] = useState(false);

  const [docState, setDocState] = useState<DocumentState>({
    title: "Untitled document",
    lastSaved: new Date(),
    wordCount: 0,
  });

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Ribbon State
  const [activeRibbonTab, setActiveRibbonTab] = useState('Format');
  const [showTemplates, setShowTemplates] = useState(false);

  // Sidebar States
  const [activeLeftPanel, setActiveLeftPanel] = useState<LeftPanelType>(LeftPanelType.NAVIGATOR);
  const [activeRightPanel, setActiveRightPanel] = useState<RightPanelType>(RightPanelType.NONE);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number }>({ show: false, x: 0, y: 0 });
  
  const [selectedText, setSelectedText] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleFormat = (command: string, value?: string) => {
    if (command === 'newTemplate') {
      setShowTemplates(true);
      return;
    }

    // --- Image Handling Logic ---
    if (command.startsWith('img')) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node: Node | null = selection.anchorNode;
        // Traverse up to find image or wrapper if an image is selected
        // In some browsers, clicking an image selects the wrapper div or range.
        
        // Helper to find selected image
        const findSelectedImage = (): HTMLImageElement | null => {
          if (node?.nodeName === 'IMG') return node as HTMLImageElement;
          
          // If range selects an image
          const range = selection.getRangeAt(0);
          if (range.commonAncestorContainer.nodeName === 'IMG') {
             return range.commonAncestorContainer as HTMLImageElement;
          }
          const div = range.commonAncestorContainer as HTMLElement;
          if (div && div.querySelector) {
             const img = div.querySelector('img');
             // Rough heuristic: if selection is inside a small block with an image
             if (img && range.intersectsNode(img)) return img;
          }
          return null;
        };

        const img = findSelectedImage();
        
        if (img) {
          if (command === 'imgAlignLeft') {
            img.style.display = 'block';
            img.style.marginRight = 'auto';
            img.style.marginLeft = '0';
            img.style.float = 'none';
          } else if (command === 'imgAlignCenter') {
             img.style.display = 'block';
             img.style.margin = '0 auto';
             img.style.float = 'none';
          } else if (command === 'imgAlignRight') {
             img.style.display = 'block';
             img.style.marginLeft = 'auto';
             img.style.marginRight = '0';
             img.style.float = 'none';
          } else if (command === 'imgFloatLeft') {
             img.style.float = 'left';
             img.style.margin = '0 1em 1em 0';
             img.style.display = 'block';
          } else if (command === 'imgFloatRight') {
             img.style.float = 'right';
             img.style.margin = '0 0 1em 1em';
             img.style.display = 'block';
          } else if (command === 'imgNone') { // Inline
             img.style.float = 'none';
             img.style.display = 'inline';
             img.style.margin = '0';
          } else if (command === 'imgBreak') { // Break Text
             img.style.display = 'block';
             img.style.float = 'none';
             img.style.width = '100%';
             img.style.height = 'auto';
          }
          updateStats();
          return; // Stop standard execCommand
        }
      }
    }
    
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    updateStats();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ show: true, x: e.pageX, y: e.pageY });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, show: false });
  };

  const updateStats = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      const count = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
      setDocState(prev => ({ ...prev, wordCount: count, lastSaved: new Date() }));
      
      // Placeholder logic
      if (text.trim() === "") {
        editorRef.current.classList.add("empty-editor");
      } else {
        editorRef.current.classList.remove("empty-editor");
      }
    }
  };

  const handleInsertText = (text: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, text);
      updateStats();
    }
  };

  const handleTemplateSelect = (template: string) => {
    setShowTemplates(false);
    setActiveRibbonTab('Format');
    // In a real app, this would load the template content
    if (editorRef.current) {
      editorRef.current.innerHTML = `<p>Started new document from <b>${template}</b> template.</p>`;
      updateStats();
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl or Meta (Command on Mac)
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        
        switch (key) {
          case 'b':
            e.preventDefault();
            handleFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            handleFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            handleFormat('underline');
            break;
          case 's':
            e.preventDefault();
            // Save to backend
            if (documentId && editorRef.current) {
              const content = {
                html: editorRef.current.innerHTML,
                text: editorRef.current.innerText
              };
              documentAPI.update(documentId, {
                title: docState.title,
                content: content
              })
                .then(() => {
                  setDocState(prev => ({ ...prev, lastSaved: new Date() }));
                })
                .catch(error => {
                  console.error('Save failed:', error);
                });
            }
            break;
          case 'z':
            e.preventDefault();
            handleFormat('undo');
            break;
          case 'y':
            e.preventDefault();
            handleFormat('redo');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Initialize placeholder state
    if (editorRef.current) {
       if (editorRef.current.innerText.trim() === "") {
         editorRef.current.classList.add("empty-editor");
       }
    }

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        setSelectedText(selection.toString());
      } else {
        setSelectedText("");
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Load document from backend when documentId changes
  useEffect(() => {
    if (documentId && editorRef.current) {
      setIsLoading(true);
      documentAPI.get(documentId)
        .then(response => {
          const doc = response.data;
          setDocState(prev => ({ ...prev, title: doc.title }));
          if (doc.content && typeof doc.content === 'object' && doc.content.html) {
            editorRef.current!.innerHTML = doc.content.html;
          } else if (doc.content && typeof doc.content === 'string') {
            editorRef.current!.innerHTML = doc.content;
          }
          updateStats();
        })
        .catch(error => {
          console.error('Failed to load document:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [documentId]);

  // Auto-save document every 30 seconds
  useEffect(() => {
    if (!documentId || !editorRef.current) return;

    const autoSaveInterval = setInterval(() => {
      if (editorRef.current && documentId) {
        const content = {
          html: editorRef.current.innerHTML,
          text: editorRef.current.innerText
        };

        documentAPI.update(documentId, {
          title: docState.title,
          content: content
        })
          .then(() => {
            setDocState(prev => ({ ...prev, lastSaved: new Date() }));
          })
          .catch(error => {
            console.error('Auto-save failed:', error);
          });
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [documentId, docState.title]);

  const toggleLeftPanel = (type: LeftPanelType) => {
    setActiveLeftPanel(current => current === type ? LeftPanelType.NONE : type);
  };

  const toggleRightPanel = (type: RightPanelType) => {
    setActiveRightPanel(current => current === type ? RightPanelType.NONE : type);
  };

  const SidebarIcon = ({ 
    icon: Icon, 
    type, 
    activeType 
  }: { 
    icon: any, 
    type: LeftPanelType, 
    activeType: LeftPanelType 
  }) => {
    const isActive = activeType === type;
    return (
      <div className="w-full flex items-center justify-center py-2">
        <button 
          onClick={() => toggleLeftPanel(type)}
          className={`
            p-3 rounded-2xl transition-all duration-200 group relative
            ${isActive 
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md ring-1 ring-slate-200 dark:ring-slate-700' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }
          `}
          title={type.toString()}
        >
          <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
          
          {/* Notification Dot Example for Collab */}
          {type === LeftPanelType.COLLAB && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0f172a]"></span>
          )}
        </button>
      </div>
    );
  };

  // --- RENDER FULL SCREEN FILE DASHBOARD IF TAB IS 'File' ---
  if (activeRibbonTab === 'File') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        {showTemplates && <TemplateGallery onClose={() => setShowTemplates(false)} onSelect={handleTemplateSelect} />}
        <FileDashboard 
          onBack={() => setActiveRibbonTab('Format')} 
          onOpenTemplates={() => setShowTemplates(true)}
        />
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-300 overflow-hidden font-sans transition-colors duration-200">
        
        {showTemplates && <TemplateGallery onClose={() => setShowTemplates(false)} onSelect={handleTemplateSelect} />}
        
        {/* Custom Context Menu */}
        {contextMenu.show && (
          <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            onClose={closeContextMenu} 
            onFormat={(cmd, val) => { handleFormat(cmd, val); closeContextMenu(); }} 
          />
        )}

        {/* 1. PRIMARY LEFT NAVIGATION (ICON STRIP) */}
        <div className="w-[72px] bg-slate-50 dark:bg-[#0f172a] flex flex-col items-center py-6 z-50 flex-shrink-0 h-full border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
          
          {/* Brand Logo / Top Action */}
          <div className="mb-8">
             <button className="flex items-center justify-center">
               <DarevelLogo />
             </button>
          </div>
          
          {/* Main Nav Items */}
          <div className="flex flex-col items-center flex-1 w-full overflow-y-auto gap-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
             <SidebarIcon icon={FileText} type={LeftPanelType.NAVIGATOR} activeType={activeLeftPanel} />
             <SidebarIcon icon={Search} type={LeftPanelType.SEARCH} activeType={activeLeftPanel} />
             <SidebarIcon icon={Sparkles} type={LeftPanelType.AI} activeType={activeLeftPanel} />
             <SidebarIcon icon={ImageIcon} type={LeftPanelType.MEDIA} activeType={activeLeftPanel} />
             <SidebarIcon icon={Layers} type={LeftPanelType.SNIPPETS} activeType={activeLeftPanel} />
             <SidebarIcon icon={Users} type={LeftPanelType.COLLAB} activeType={activeLeftPanel} />
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto flex flex-col items-center gap-6 pb-2">
              <button 
                onClick={toggleTheme}
                className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" 
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                 {isDarkMode ? <Moon size={20} strokeWidth={1.5} /> : <Sun size={20} strokeWidth={1.5} />}
              </button>
              
              <div className="text-center opacity-40">
                 <p className="text-[9px] font-medium leading-tight text-slate-500 dark:text-slate-400">Darevel</p>
                 <p className="text-[9px] leading-tight text-slate-400 dark:text-slate-500">v. 1.0</p>
              </div>
          </div>
        </div>

        {/* 2. EXPANDABLE LEFT PANEL CONTENT */}
        {activeLeftPanel !== LeftPanelType.NONE && (
          <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col shadow-2xl relative z-40 transition-all duration-300">
            {activeLeftPanel === LeftPanelType.AI ? (
              <AIAssistant 
                documentContext={editorRef.current?.innerText || ""}
                selectedText={selectedText}
                onInsert={handleInsertText}
              />
            ) : (
              <LeftSidebarPanel type={activeLeftPanel} docStats={docState} onClose={() => setActiveLeftPanel(LeftPanelType.NONE)} />
            )}
          </div>
        )}

        {/* 3. MAIN CONTENT AREA */}
        {/* Updated Main Background to deep dark blue #0b1120 */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100 dark:bg-[#0b1120] relative transition-colors duration-200">
          
          {/* Header Row */}
          <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-[#0f172a] z-30 transition-colors duration-200">
            <div className="flex items-center gap-4">
               {/* Simple Menu Trigger since sidebar is now permanent strip */}
               <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden">
                  <Menu size={20} />
               </button>
               <h1 className="text-lg font-normal text-slate-700 dark:text-slate-200">
                 <span className="font-semibold text-black dark:text-white">Darevel</span> Docs
               </h1>
               <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
               <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">v1.0</span>
                  <span>Last edit was seconds ago</span>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <button 
                 onClick={() => toggleRightPanel(RightPanelType.COMMENTS)}
                 className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${activeRightPanel === RightPanelType.COMMENTS ? 'text-sky-500 bg-sky-50 dark:bg-slate-800' : 'text-slate-400'}`}
               >
                 <MessageSquare size={20} />
               </button>
               <button 
                 onClick={() => toggleRightPanel(RightPanelType.HISTORY)}
                 className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
               >
                 <History size={20} />
               </button>
               <button
                 onClick={() => toggleRightPanel(RightPanelType.SETTINGS)}
                 className={`p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${activeRightPanel === RightPanelType.SETTINGS ? 'text-sky-500 bg-sky-50 dark:bg-slate-800' : ''}`}
               >
                 <Settings size={20} />
               </button>

               {/* User Profile Dropdown */}
               <div className="relative ml-2">
                 <button
                   onClick={() => setShowProfileMenu(!showProfileMenu)}
                   className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg ring-2 ring-white dark:ring-slate-800 hover:ring-sky-300 transition-all"
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
                       <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                         <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-xl font-bold text-white">
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

          {/* Menu & Ribbon Container */}
          <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] z-20 transition-colors duration-200">
             
             {/* Top Menu Links (Tab Switchers) */}
             <div className="flex items-center justify-between px-2 pt-2 border-b border-slate-200 dark:border-slate-800">
               <div className="flex-1">
                  <MenuBar activeTab={activeRibbonTab} onTabChange={setActiveRibbonTab} />
               </div>
               
               <div className="flex items-center gap-2 px-2 pb-1">
                  <button className="px-5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-xs font-semibold tracking-wide transition-all shadow-md active:transform active:scale-95">
                    Share
                  </button>
                  <button className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    <MoreHorizontal size={20} />
                  </button>
               </div>
             </div>

             {/* Ribbon Component */}
             <Ribbon activeTab={activeRibbonTab} onFormat={handleFormat} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
          </div>

          {/* Workspace Scroller */}
          {/* Main Background set to #0b1120 */}
          <div className="flex-1 overflow-hidden relative flex bg-slate-100 dark:bg-[#0b1120] transition-colors duration-200">
             
             {/* Document Area */}
             <main className="flex-1 overflow-y-auto flex justify-center p-8 pb-20 scroll-smooth relative" onClick={() => editorRef.current?.focus()}>
                <div 
                  className="doc-shadow w-[816px] min-h-[1056px] bg-white text-black p-[96px] relative animate-in fade-in zoom-in-95 duration-300"
                  onContextMenu={handleContextMenu}
                >
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={updateStats}
                      data-placeholder="Start typing or press '/' for AI..."
                      className="outline-none min-h-[800px] w-full text-[11pt] leading-relaxed selection:bg-sky-200 selection:text-black"
                      style={{ fontFamily: 'Calibri, sans-serif' }}
                    />
                </div>
             </main>

             {/* 4. EXPANDABLE RIGHT PANEL */}
             {activeRightPanel !== RightPanelType.NONE && (
                <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col shadow-2xl z-30 transition-all duration-300">
                   <RightSidebarPanel type={activeRightPanel} documentId={documentId} onClose={() => setActiveRightPanel(RightPanelType.NONE)} />
                </div>
             )}

          </div>

          {/* Status Bar */}
          <footer className="h-7 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 text-[10px] uppercase tracking-wider font-medium text-slate-500 select-none z-30 transition-colors duration-200">
             <div className="flex items-center gap-4">
                <span className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer">Page 1 of 1</span>
                <span className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer">{docState.wordCount} words</span>
                <span className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer text-emerald-500 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Saved
                </span>
             </div>
             <div className="flex items-center gap-4">
                <span className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer">English (US)</span>
                <span className="hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer flex items-center gap-1">
                   <AlignJustify size={10} /> Web Layout
                </span>
             </div>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default App;
