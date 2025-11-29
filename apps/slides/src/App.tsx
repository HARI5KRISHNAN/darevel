
import React, { useState, useRef, useEffect } from 'react';
import Ribbon from './components/Ribbon';
import AIAssistant from './components/AIAssistant';
import MenuBar from './components/MenuBar';
import FileDashboard from './components/FileDashboard';
import TemplateGallery from './components/TemplateGallery';
import ContextMenu from './components/ContextMenu';
import { LeftSidebarPanel, RightSidebarPanel } from './components/SidebarPanels';
import {
  Sparkles, MessageSquare, Search, FileText, Plus, Menu,
  Image as ImageIcon, Layers, BarChart2, Users, Settings,
  Moon, Sun, Presentation, Play, Square, Minus, ZoomIn, ZoomOut,
  PlusSquare, LayoutGrid, LogOut, User, Mail
} from 'lucide-react';
import { DocumentState, LeftPanelType, RightPanelType, Slide } from './types';
import { presentationAPI, slideAPI } from './services/api';
import { useAuth } from './contexts/AuthContext';

// Custom Geometric Logo Component
const DarevelLogo = () => (
  <svg width="42" height="42" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform hover:scale-105">
    <path d="M4 4H20V20Z" fill="#2563EB"/> {/* Blue Top Triangle */}
    <path d="M20 4H24C32.8 4 40 11.2 40 20H20V4Z" fill="#DC2626"/> {/* Red Top Arch */}
    <path d="M20 20H40C40 28.8 32.8 36 24 36H20V20Z" fill="#EAB308"/> {/* Yellow Bottom Curve */}
    <path d="M4 20H20V36H4V20Z" fill="#16A34A"/> {/* Green Bottom Square */}
  </svg>
);

const App: React.FC = () => {
  // Auth context
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Backend integration state
  const [presentationId, setPresentationId] = useState<string | null>(null);
  const [orgId] = useState<string>('default-org');
  const [isLoading, setIsLoading] = useState(false);

  // --- SLIDE STATE ---
  const [slides, setSlides] = useState<Slide[]>([
    { id: '1', content: '<div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;"><h1 style="font-size: 48px; font-weight: bold; margin-bottom: 24px;">Darevel Slides</h1><p style="font-size: 24px; color: gray;">Click to add subtitle</p></div>' }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [docState, setDocState] = useState<DocumentState>({
    title: "Darevel Slides",
    lastSaved: new Date(),
    slideCount: 1,
    currentSlideIndex: 0
  });

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Ribbon State
  const [activeRibbonTab, setActiveRibbonTab] = useState('Home');
  const [showTemplates, setShowTemplates] = useState(false);

  // Sidebar States
  const [activeLeftPanel, setActiveLeftPanel] = useState<LeftPanelType>(LeftPanelType.NAVIGATOR);
  const [activeRightPanel, setActiveRightPanel] = useState<RightPanelType>(RightPanelType.NONE);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number }>({ show: false, x: 0, y: 0 });
  
  const [selectedText, setSelectedText] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- SLIDE MANAGEMENT ---

  const addNewSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      content: '<div style="padding: 40px;"><h2 style="font-size: 32px; font-weight: bold; margin-bottom: 20px;">Click to add title</h2><ul style="font-size: 20px; margin-left: 20px;"><li>Click to add text</li></ul></div>'
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlideIndex + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
    setDocState(prev => ({...prev, slideCount: newSlides.length}));
  };

  const switchSlide = (index: number) => {
    // Save current content first
    if (editorRef.current) {
       const updatedSlides = [...slides];
       updatedSlides[currentSlideIndex].content = editorRef.current.innerHTML;
       setSlides(updatedSlides);
    }
    setCurrentSlideIndex(index);
  };

  // Load presentation from backend when presentationId changes
  useEffect(() => {
    if (presentationId) {
      setIsLoading(true);
      presentationAPI.get(presentationId)
        .then(response => {
          const presentation = response.data;
          setDocState(prev => ({ ...prev, title: presentation.title }));

          // Load slides for this presentation
          return slideAPI.list(presentationId);
        })
        .then(response => {
          const loadedSlides = response.data || [];
          if (loadedSlides.length > 0) {
            const formattedSlides = loadedSlides.map((slide: any) => ({
              id: slide.id.toString(),
              content: slide.content || '<div style="padding: 40px;"><h2>Empty Slide</h2></div>'
            }));
            setSlides(formattedSlides);
            setDocState(prev => ({ ...prev, slideCount: formattedSlides.length }));
          }
        })
        .catch(error => {
          console.error('Error loading presentation:', error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [presentationId]);

  // Auto-save presentation every 30 seconds
  useEffect(() => {
    if (!presentationId) return;

    const autoSaveInterval = setInterval(() => {
      // Save presentation metadata
      presentationAPI.update(presentationId, {
        title: docState.title,
        slideCount: slides.length
      }).then(() => {
        setDocState(prev => ({ ...prev, lastSaved: new Date() }));
      }).catch(error => {
        console.error('Auto-save error:', error);
      });

      // Save current slide content
      if (editorRef.current && slides[currentSlideIndex]) {
        const content = editorRef.current.innerHTML;
        const slideId = slides[currentSlideIndex].id;
        slideAPI.update(presentationId, slideId, {
          content: content,
          position: currentSlideIndex
        }).catch(error => {
          console.error('Slide save error:', error);
        });
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [presentationId, slides, currentSlideIndex, docState.title]);

  // Sync editor content when currentSlideIndex changes
  useEffect(() => {
    if (editorRef.current && slides[currentSlideIndex]) {
      editorRef.current.innerHTML = slides[currentSlideIndex].content;
      setDocState(prev => ({...prev, currentSlideIndex}));
    }
  }, [currentSlideIndex]);

  const updateCurrentSlideContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      // Lightweight update to reference to avoid full re-render lag
      slides[currentSlideIndex].content = content; 
      setDocState(prev => ({ ...prev, lastSaved: new Date() }));
    }
  };

  // --- FORMATTING COMMANDS ---

  const handleFormat = (command: string, value?: string) => {
    if (command === 'newTemplate') { setShowTemplates(true); return; }
    if (command === 'newSlide') { addNewSlide(); return; }

    // Basic Image alignment for slides (using CSS transform or flex mostly)
    if (command.startsWith('img')) {
      // Logic same as doc but context specific to slide container
      document.execCommand(command, false, value); // Fallback
    } else {
      document.execCommand(command, false, value);
    }
    
    if (editorRef.current) editorRef.current.focus();
    updateCurrentSlideContent();
  };

  const handleTemplateSelect = (template: string) => {
    setShowTemplates(false);
    setSlides([{ id: Date.now().toString(), content: `<div style="height:100%; display:flex; justify-content:center; align-items:center;"><h1>${template}</h1></div>` }]);
    setCurrentSlideIndex(0);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        switch (key) {
          case 'b': e.preventDefault(); handleFormat('bold'); break;
          case 'i': e.preventDefault(); handleFormat('italic'); break;
          case 'u': e.preventDefault(); handleFormat('underline'); break;
          case 's':
            e.preventDefault();
            // Manual save to backend
            if (presentationId && editorRef.current) {
              const content = editorRef.current.innerHTML;
              const slideId = slides[currentSlideIndex]?.id;

              // Save presentation metadata
              presentationAPI.update(presentationId, {
                title: docState.title,
                slideCount: slides.length
              }).then(() => {
                setDocState(prev => ({ ...prev, lastSaved: new Date() }));
              });

              // Save current slide content
              if (slideId) {
                slideAPI.update(presentationId, slideId, {
                  content: content,
                  position: currentSlideIndex
                });
              }
            } else {
              // No presentationId, just update UI
              setDocState(prev => ({ ...prev, lastSaved: new Date() }));
            }
            break;
          case 'm': e.preventDefault(); addNewSlide(); break; // New Slide
          default: break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides, currentSlideIndex, presentationId, docState.title]);

  // --- RENDER FULL SCREEN FILE DASHBOARD IF TAB IS 'File' ---
  if (activeRibbonTab === 'File') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        {showTemplates && <TemplateGallery onClose={() => setShowTemplates(false)} onSelect={handleTemplateSelect} />}
        <FileDashboard 
          onBack={() => setActiveRibbonTab('Home')} 
          onOpenTemplates={() => setShowTemplates(true)}
        />
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-300 overflow-hidden font-sans transition-colors duration-200">
        
        {showTemplates && <TemplateGallery onClose={() => setShowTemplates(false)} onSelect={handleTemplateSelect} />}
        
        {/* Context Menu */}
        {contextMenu.show && (
          <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            onClose={() => setContextMenu({...contextMenu, show: false})} 
            onFormat={(cmd, val) => { handleFormat(cmd, val); setContextMenu({...contextMenu, show: false}); }} 
          />
        )}

        {/* 1. PRIMARY LEFT NAVIGATION (ICON STRIP) */}
        <div className="w-[68px] bg-slate-50 dark:bg-[#0f172a] flex flex-col items-center py-6 z-50 flex-shrink-0 h-full border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
          <div className="mb-8"><button className="flex items-center justify-center"><DarevelLogo /></button></div>
          <div className="flex flex-col items-center flex-1 w-full overflow-y-auto gap-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
             {/* 1. SLIDES PANEL (Active) */}
             <SidebarIcon icon={Layers} type={LeftPanelType.NAVIGATOR} activeType={activeLeftPanel} onClick={setActiveLeftPanel} />
             {/* 2. INSERT PANEL */}
             <SidebarIcon icon={PlusSquare} type={LeftPanelType.INSERT} activeType={activeLeftPanel} onClick={setActiveLeftPanel} />
             {/* 3. SEARCH PANEL */}
             <SidebarIcon icon={Search} type={LeftPanelType.SEARCH} activeType={activeLeftPanel} onClick={setActiveLeftPanel} />
             {/* 4. AI DESIGNER PANEL */}
             <SidebarIcon icon={Sparkles} type={LeftPanelType.AI} activeType={activeLeftPanel} onClick={setActiveLeftPanel} />
             {/* 5. MEDIA LIBRARY PANEL */}
             <SidebarIcon icon={ImageIcon} type={LeftPanelType.MEDIA} activeType={activeLeftPanel} onClick={setActiveLeftPanel} />
             {/* 6. ELEMENTS & SNIPPETS PANEL */}
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
                documentContext={editorRef.current?.innerText || ""}
                selectedText={selectedText}
                onInsert={(text) => handleFormat('insertText', text)}
              />
            ) : (
              <LeftSidebarPanel type={activeLeftPanel} docStats={{ wordCount: 0 }} presentationId={presentationId} onClose={() => setActiveLeftPanel(LeftPanelType.NONE)} />
            )}
          </div>
        )}

        {/* 3. MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#e5e5e5] dark:bg-[#18181b] relative transition-colors duration-200">
          
          {/* Header */}
          <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-[#0f172a] z-30">
            <div className="flex items-center gap-4">
               <h1 className="text-lg font-normal text-slate-700 dark:text-slate-200 flex items-center gap-2">
                 <Presentation className="text-orange-500" size={20} />
                 <span className="font-semibold text-black dark:text-white">{docState.title}</span>
               </h1>
            </div>
            <div className="flex items-center gap-2">
               <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg">
                  <Play size={16} fill="currentColor" /> Present
               </button>
               <button onClick={() => setActiveRightPanel(activeRightPanel === RightPanelType.COMMENTS ? RightPanelType.NONE : RightPanelType.COMMENTS)} className="p-2 text-slate-400 hover:text-white"><MessageSquare size={20} /></button>

               {/* User Profile Dropdown */}
               <div className="relative ml-2">
                 <button
                   onClick={() => setShowProfileMenu(!showProfileMenu)}
                   className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-orange-300 transition-all"
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
                       <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-900 dark:to-slate-800">
                         <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xl font-bold text-white">
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

          {/* SLIDE WORKSPACE */}
          <div className="flex-1 overflow-hidden relative flex bg-[#f0f0f0] dark:bg-[#0b1120] transition-colors duration-200">
             
             {/* LEFT: SLIDE FILMSTRIP */}
             <div className="w-56 bg-slate-100 dark:bg-[#0f172a]/50 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 overflow-y-auto z-10">
                {slides.map((slide, index) => (
                   <div 
                      key={slide.id}
                      onClick={() => switchSlide(index)}
                      className="mb-4 cursor-pointer relative group flex gap-2"
                   >
                      <div className="text-xs font-medium text-slate-400 w-4 text-right pt-2">{index + 1}</div>
                      <div className={`
                        flex-1 aspect-video bg-white dark:bg-[#1e293b] shadow-sm rounded-lg border-2 overflow-hidden relative
                        ${index === currentSlideIndex ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'}
                      `}>
                         <div className="scale-[0.2] origin-top-left w-[500%] h-[500%] p-8 pointer-events-none select-none text-slate-800 dark:text-slate-200" dangerouslySetInnerHTML={{__html: slide.content}}></div>
                      </div>
                   </div>
                ))}
                <button 
                  onClick={addNewSlide}
                  className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-400 hover:border-orange-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
                >
                   <Plus size={18} /> <span className="text-sm font-medium">New Slide</span>
                </button>
             </div>

             {/* CENTER: MAIN SLIDE CANVAS */}
             <main className="flex-1 overflow-y-auto flex items-center justify-center p-8 bg-[#18181b]" onClick={() => editorRef.current?.focus()}>
                <div 
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                  className="transition-transform duration-200 ease-out origin-center"
                >
                  <div 
                    className="aspect-video w-[960px] h-[540px] bg-white text-black relative shadow-2xl rounded-sm overflow-hidden"
                    onContextMenu={(e) => { e.preventDefault(); setContextMenu({ show: true, x: e.pageX, y: e.pageY }); }}
                  >
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={updateCurrentSlideContent}
                        className="outline-none w-full h-full p-8 text-[14pt] leading-normal selection:bg-orange-200 selection:text-black slide-editor"
                        style={{ fontFamily: 'Calibri, sans-serif' }}
                      />
                  </div>
                </div>
             </main>

             {/* RIGHT PANEL */}
             {activeRightPanel !== RightPanelType.NONE && (
                <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col shadow-2xl z-30">
                   <RightSidebarPanel type={activeRightPanel} presentationId={presentationId} onClose={() => setActiveRightPanel(RightPanelType.NONE)} />
                </div>
             )}
          </div>

          {/* STATUS BAR */}
          <footer className="h-8 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 text-[11px] font-medium text-slate-500 select-none z-30">
             <div className="flex items-center gap-4">
                <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
                <span>English (US)</span>
             </div>
             <div className="flex items-center gap-4">
                <button onClick={() => setZoomLevel(100)} className="hover:text-white"><Square size={12} /></button>
                <div className="flex items-center gap-2">
                   <button onClick={() => setZoomLevel(Math.max(10, zoomLevel - 10))}><Minus size={12} /></button>
                   <div className="w-24 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${zoomLevel / 2}%` }}></div>
                   </div>
                   <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}><Plus size={12} /></button>
                   <span className="w-8 text-right">{zoomLevel}%</span>
                </div>
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
        className={`p-3 rounded-xl transition-all ${isActive ? 'bg-white text-blue-600' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
      >
        <Icon size={20} />
      </button>
    </div>
  );
};

export default App;
