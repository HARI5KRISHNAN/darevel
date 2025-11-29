
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, Undo, Redo, Printer, Save,
  Type, Highlighter, Palette, 
  Image as ImageIcon, Table, Box, Smile, 
  PanelTop, PanelBottom, Link, 
  ZoomIn, ZoomOut, Maximize, Grid, Layout,
  Cpu, SpellCheck, BarChart2, Lock,
  Puzzle, Play, HelpCircle, Book, Keyboard,
  ChevronDown, Minus, Plus, Search, Scissors, Copy, Clipboard,
  Trash2, Filter, FileText,
  MousePointer2, History, RotateCcw, 
  Heading, BoxSelect, Replace, 
  Minimize, Monitor, BookOpen, Columns, Ruler, MessageSquare, 
  MessageCircle, Moon, Sun, Eye, PieChart, 
  PenTool, FunctionSquare, Sigma, Binary,
  CheckSquare, Sparkles, PaintBucket, 
  WrapText, Merge, DollarSign, Percent, Hash,
  ArrowRight, CreditCard, Database, ArrowDown, 
  ArrowUp, FilterX, SortAsc, SortDesc,
  LayoutGrid, FileSpreadsheet, Sheet, Table2,
  Eraser, Clock, Calculator, MoreHorizontal,
  Code, Globe, Map, Users, Flag, Lightbulb, Scale, Info, 
  Music, Video, Check, X, Circle, MousePointer, MousePointerClick,
  QrCode, SigmaSquare, Braces, Webhook, FileCode, RefreshCw,
  Shield, EyeOff, GitMerge, FileSearch, BookOpenCheck, LifeBuoy, Terminal
} from 'lucide-react';

interface RibbonProps {
  activeTab: string;
  onFormat: (command: string, value?: string) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const RibbonGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
  <div className="flex flex-col h-full px-4 border-r-2 border-slate-200 dark:border-slate-600 last:border-0 min-w-max flex-auto justify-center group relative py-2">
    <div className="flex-1 flex items-center justify-center gap-3 px-1">
      {children}
    </div>
    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wider mt-1 pb-0.5 opacity-90">
      {label}
    </div>
  </div>
);

const Ribbon: React.FC<RibbonProps> = ({ activeTab, onFormat, isDarkMode, onToggleTheme }) => {
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState(11);
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const fontSizeRef = useRef<HTMLDivElement>(null);

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 36, 48];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) setIsFontSizeOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormatClick = (cmd: string, arg?: string) => {
    onFormat(cmd, arg);
    if (['bold', 'italic', 'underline', 'wrap', 'merge'].includes(cmd)) {
       setActiveFormats(prev => {
         const newSet = new Set(prev);
         if (newSet.has(cmd)) newSet.delete(cmd);
         else newSet.add(cmd);
         return newSet;
       });
    }
  };

  // UI Components
  const BigBtn = ({ icon: Icon, label, onClick, active, cmd, title }: any) => (
    <button 
      onClick={() => onClick ? onClick() : (cmd && handleFormatClick(cmd))}
      className={`
        flex flex-col items-center justify-center h-[88px] w-[84px] rounded-xl gap-2 transition-all flex-shrink-0
        ${active 
          ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' 
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
        }
      `}
      title={title || label}
    >
      <Icon size={32} strokeWidth={1.5} />
      <span className="text-[12px] font-medium text-center leading-tight px-1 line-clamp-2">{label}</span>
    </button>
  );

  const SmallBtn = ({ icon: Icon, onClick, active, cmd, title, label }: any) => (
    <button 
      onClick={() => onClick ? onClick() : (cmd && handleFormatClick(cmd))}
      className={`
        p-2 rounded-lg transition-all flex-shrink-0 flex items-center justify-center gap-2
        ${active 
          ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' 
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
        }
      `}
      title={title || label}
    >
      <Icon size={18} strokeWidth={1.5} />
      {label && <span className="text-xs font-medium">{label}</span>}
    </button>
  );

  // --- RENDERERS ---

  const renderHomeRibbon = () => (
    <>
      <RibbonGroup label="Clipboard">
         <BigBtn icon={Clipboard} label="Paste" cmd="paste" title="Paste (Ctrl+V)" />
         <div className="flex flex-col gap-1 w-24">
            <div className="flex gap-1"><SmallBtn icon={Scissors} cmd="cut" title="Cut" /><SmallBtn icon={Copy} cmd="copy" title="Copy" /></div>
            <div className="flex gap-1"><SmallBtn icon={Clipboard} title="Paste Special" /><SmallBtn icon={PaintBucket} title="Format Painter" /></div>
         </div>
      </RibbonGroup>

      <RibbonGroup label="Editing">
         <div className="grid grid-cols-2 gap-1 w-32">
            <SmallBtn icon={Search} label="Find" />
            <SmallBtn icon={Replace} label="Replace" />
            <SmallBtn icon={ArrowDown} label="Fill Down" />
            <SmallBtn icon={Eraser} label="Clear" />
         </div>
      </RibbonGroup>
      
      <RibbonGroup label="Font">
         <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button className="w-32 px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs text-left text-slate-700 dark:text-slate-300">Calibri</button>
              <div className="relative" ref={fontSizeRef}>
                 <button onClick={() => setIsFontSizeOpen(!isFontSizeOpen)} className="w-12 px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs text-center text-slate-700 dark:text-slate-300">{fontSize}</button>
                 {isFontSizeOpen && (
                   <div className="absolute top-full left-0 w-12 bg-white dark:bg-slate-800 border z-50 max-h-40 overflow-y-auto">
                      {fontSizes.map(s => <div key={s} onClick={() => {setFontSize(s); setIsFontSizeOpen(false)}} className="px-1 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-xs">{s}</div>)}
                   </div>
                 )}
              </div>
            </div>
            <div className="flex gap-1">
               <SmallBtn icon={Bold} cmd="bold" active={activeFormats.has('bold')} />
               <SmallBtn icon={Italic} cmd="italic" active={activeFormats.has('italic')} />
               <SmallBtn icon={Underline} cmd="underline" active={activeFormats.has('underline')} />
               <SmallBtn icon={Palette} title="Text Color" />
               <SmallBtn icon={PaintBucket} title="Cell Color" />
            </div>
         </div>
      </RibbonGroup>

      <RibbonGroup label="Alignment">
         <div className="grid grid-cols-3 gap-1 w-28">
            <SmallBtn icon={AlignLeft} cmd="justifyLeft" />
            <SmallBtn icon={AlignCenter} cmd="justifyCenter" />
            <SmallBtn icon={AlignRight} cmd="justifyRight" />
            <SmallBtn icon={ArrowRight} title="Increase Indent" />
            <SmallBtn icon={WrapText} cmd="wrap" title="Wrap Text" />
            <SmallBtn icon={Merge} cmd="merge" title="Merge Cells" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Number">
         <div className="grid grid-cols-3 gap-1 w-28">
            <SmallBtn icon={Hash} title="General" />
            <SmallBtn icon={DollarSign} title="Currency" />
            <SmallBtn icon={Percent} title="Percent" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Structure">
        <div className="flex flex-col gap-1">
          <SmallBtn icon={Plus} label="Insert Row" />
          <SmallBtn icon={Plus} label="Insert Col" />
        </div>
      </RibbonGroup>
    </>
  );

  const renderInsertRibbon = () => (
    <>
      <RibbonGroup label="Tables">
         <BigBtn icon={Table} label="PivotTable" />
         <BigBtn icon={Table2} label="Table" />
         <BigBtn icon={BarChart2} label="Chart" />
      </RibbonGroup>

      <RibbonGroup label="Media">
         <div className="grid grid-cols-2 gap-1 w-32">
            <SmallBtn icon={ImageIcon} label="Image" />
            <SmallBtn icon={Smile} label="Icon" />
            <SmallBtn icon={Box} label="Shape" />
            <SmallBtn icon={Type} label="Text Box" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Form Controls">
        <div className="grid grid-cols-2 gap-1 w-32">
           <SmallBtn icon={CheckSquare} label="Check" />
           <SmallBtn icon={Circle} label="Radio" />
           <SmallBtn icon={List} label="Drop" />
           <SmallBtn icon={MousePointerClick} label="Button" />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Elements">
        <div className="grid grid-cols-3 gap-1 w-36">
           <SmallBtn icon={Link} title="Hyperlink" />
           <SmallBtn icon={MessageSquare} title="Comment" />
           <SmallBtn icon={FileText} title="Note" />
           <SmallBtn icon={SigmaSquare} title="Equation" />
           <SmallBtn icon={PenTool} title="Sign" />
           <SmallBtn icon={QrCode} title="QR Code" />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Advanced">
        <div className="flex flex-col gap-1">
           <SmallBtn icon={Layout} label="Sparklines" />
           <SmallBtn icon={Code} label="Embed HTML" />
        </div>
      </RibbonGroup>
    </>
  );

  const renderPageLayoutRibbon = () => (
    <>
       <RibbonGroup label="Theme">
          <BigBtn icon={Layout} label="Theme" />
          <div className="flex flex-col gap-1">
            <SmallBtn icon={Palette} label="Colors" />
            <SmallBtn icon={Type} label="Fonts" />
          </div>
       </RibbonGroup>
       
       <RibbonGroup label="Page Setup">
          <BigBtn icon={RotateCcw} label="Orient" />
          <div className="grid grid-cols-2 gap-1 w-32">
             <SmallBtn icon={BoxSelect} label="Size" />
             <SmallBtn icon={PanelTop} label="Margins" />
             <SmallBtn icon={Printer} label="Print Area" />
             <SmallBtn icon={Scissors} label="Breaks" />
          </div>
       </RibbonGroup>

       <RibbonGroup label="Background">
          <BigBtn icon={ImageIcon} label="Backgrnd" />
          <BigBtn icon={Lock} label="Freeze" />
       </RibbonGroup>

       <RibbonGroup label="Sheet Options">
           <div className="grid grid-cols-2 gap-1 w-32">
              <SmallBtn icon={Grid} label="Gridlines" active />
              <SmallBtn icon={Heading} label="Headings" active />
              <SmallBtn icon={PanelTop} label="Header" />
              <SmallBtn icon={PanelBottom} label="Footer" />
           </div>
       </RibbonGroup>

       <RibbonGroup label="Scale">
          <BigBtn icon={Maximize} label="Fit" />
          <BigBtn icon={ZoomIn} label="Zoom" />
       </RibbonGroup>
    </>
  );

  const renderFormulasRibbon = () => (
     <>
       <RibbonGroup label="Assistant">
          <BigBtn icon={Sigma} label="AutoSum" />
          <div className="flex flex-col gap-1">
             <SmallBtn icon={Calculator} label="Quick" />
             <SmallBtn icon={History} label="Recent" />
          </div>
       </RibbonGroup>

       <RibbonGroup label="Function Library">
          <div className="grid grid-cols-3 gap-1 w-48">
             <SmallBtn icon={Calculator} title="Math" />
             <SmallBtn icon={Type} title="Text" />
             <SmallBtn icon={Binary} title="Logical" />
             <SmallBtn icon={Search} title="Lookup" />
             <SmallBtn icon={BarChart2} title="Stat" />
             <SmallBtn icon={Clock} title="Date" />
             <SmallBtn icon={DollarSign} title="Finance" />
             <SmallBtn icon={Grid} title="Array" />
             <SmallBtn icon={Cpu} title="Eng" />
          </div>
       </RibbonGroup>

       <RibbonGroup label="Defined Names">
          <BigBtn icon={BoxSelect} label="Named Ranges" />
          <BigBtn icon={FunctionSquare} label="Explore" />
       </RibbonGroup>

       <RibbonGroup label="Auditing">
           <div className="grid grid-cols-2 gap-1 w-32">
             <SmallBtn icon={ArrowRight} label="Prec." />
             <SmallBtn icon={ArrowRight} label="Dep." />
             <SmallBtn icon={CheckSquare} label="Error" />
             <SmallBtn icon={Play} label="Eval" />
           </div>
       </RibbonGroup>

       <RibbonGroup label="Calculation">
          <BigBtn icon={RotateCcw} label="Recalc" />
          <SmallBtn icon={Calculator} label="Manual" />
       </RibbonGroup>
     </>
  );

  const renderDataRibbon = () => (
     <>
       <RibbonGroup label="Sort">
          <BigBtn icon={Filter} label="Filter" />
          <div className="flex flex-col gap-1">
             <SmallBtn icon={SortAsc} label="A to Z" />
             <SmallBtn icon={SortDesc} label="Z to A" />
             <SmallBtn icon={Filter} label="Custom" />
          </div>
       </RibbonGroup>

       <RibbonGroup label="Filter">
          <BigBtn icon={Filter} label="Advanced" />
          <BigBtn icon={Trash2} label="Remove Duplicates" />
       </RibbonGroup>

       <RibbonGroup label="Data Tools">
          <div className="grid grid-cols-2 gap-1 w-36">
             <SmallBtn icon={Columns} label="Cols" />
             <SmallBtn icon={Merge} label="Join" />
             <SmallBtn icon={CheckSquare} label="Valid" />
             <SmallBtn icon={List} label="Drop" />
          </div>
       </RibbonGroup>

       <RibbonGroup label="Analysis">
          <BigBtn icon={Table} label="Pivot" />
          <div className="flex flex-col gap-1">
             <SmallBtn icon={Box} label="Group" />
             <SmallBtn icon={Sigma} label="Subtotal" />
          </div>
       </RibbonGroup>

       <RibbonGroup label="Import">
          <div className="grid grid-cols-3 gap-1 w-32">
             <SmallBtn icon={FileText} title="CSV" />
             <SmallBtn icon={FileCode} title="JSON" />
             <SmallBtn icon={Globe} title="Web" />
          </div>
          <SmallBtn icon={RefreshCw} label="Refresh" />
       </RibbonGroup>

       <RibbonGroup label="AI Data">
          <SmallBtn icon={Sparkles} label="Clean" />
          <SmallBtn icon={Sparkles} label="Categorize" />
       </RibbonGroup>
     </>
  );

  const renderReviewRibbon = () => (
     <>
        <RibbonGroup label="Proofing">
           <BigBtn icon={SpellCheck} label="Spell" />
           <BigBtn icon={SpellCheck} label="Grammar" />
        </RibbonGroup>

        <RibbonGroup label="Changes">
           <BigBtn icon={History} label="Track" />
           <div className="flex flex-col gap-1">
              <SmallBtn icon={Eye} label="Markups" />
              <div className="flex gap-1"><SmallBtn icon={Check} title="Accept" /><SmallBtn icon={X} title="Reject" /></div>
           </div>
        </RibbonGroup>

        <RibbonGroup label="Comments">
           <BigBtn icon={MessageSquare} label="Add" />
           <div className="flex flex-col gap-1">
              <SmallBtn icon={MessageCircle} label="Show" />
              <SmallBtn icon={CheckSquare} label="Resolve" />
           </div>
        </RibbonGroup>

        <RibbonGroup label="Protect">
           <BigBtn icon={Shield} label="Protect" />
           <div className="flex flex-col gap-1">
              <SmallBtn icon={Lock} label="Lock Cell" />
              <SmallBtn icon={Lock} label="Perms" />
           </div>
        </RibbonGroup>

        <RibbonGroup label="Compare">
           <SmallBtn icon={History} label="History" />
           <SmallBtn icon={GitMerge} label="Compare" />
           <SmallBtn icon={Merge} label="Merge" />
        </RibbonGroup>

        <RibbonGroup label="Audit">
           <SmallBtn icon={FileSearch} label="Log" />
           <SmallBtn icon={BarChart2} label="Stats" />
           <SmallBtn icon={FileSearch} label="Inspect" />
        </RibbonGroup>

        <RibbonGroup label="AI Review">
           <SmallBtn icon={Sparkles} label="Summary" />
           <SmallBtn icon={Sparkles} label="Errors" />
        </RibbonGroup>
     </>
  );

  const renderViewRibbon = () => (
    <>
      <RibbonGroup label="Workbook Views">
         <BigBtn icon={LayoutGrid} label="Normal" active />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={FileText} label="Layout" />
            <SmallBtn icon={Scissors} label="Break" />
         </div>
         <SmallBtn icon={FunctionSquare} label="Formula" />
      </RibbonGroup>

      <RibbonGroup label="Show">
         <div className="grid grid-cols-2 gap-1 w-32">
            <SmallBtn icon={Grid} label="Grid" active />
            <SmallBtn icon={Heading} label="Heads" active />
            <SmallBtn icon={MessageSquare} label="Cmnts" />
            <SmallBtn icon={List} label="Outln" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Window">
         <BigBtn icon={Lock} label="Freeze" />
         <div className="grid grid-cols-2 gap-1 w-24">
            <SmallBtn icon={ZoomIn} title="In" />
            <SmallBtn icon={ZoomOut} title="Out" />
            <SmallBtn icon={Maximize} title="Fit" />
            <SmallBtn icon={Maximize} title="Full" />
         </div>
      </RibbonGroup>
      
      <RibbonGroup label="Canvas">
         <BigBtn icon={Map} label="MiniMap" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={Ruler} label="Ruler" />
            <SmallBtn icon={Moon} label="Dark" />
            <SmallBtn icon={Eye} label="UI Toggle" />
         </div>
      </RibbonGroup>
    </>
  );

  const renderHelpRibbon = () => (
     <>
        <RibbonGroup label="Support">
           <BigBtn icon={HelpCircle} label="Help" />
           <div className="flex flex-col gap-1">
              <SmallBtn icon={Book} label="Docs" />
              <SmallBtn icon={Keyboard} label="Keys" />
           </div>
        </RibbonGroup>
        
        <RibbonGroup label="Learning">
           <BigBtn icon={FileSpreadsheet} label="Samples" />
           <div className="flex flex-col gap-1">
              <SmallBtn icon={Sparkles} label="New" />
              <SmallBtn icon={Video} label="Videos" />
           </div>
        </RibbonGroup>

        <RibbonGroup label="Community">
           <div className="grid grid-cols-2 gap-1 w-28">
              <SmallBtn icon={Users} label="Forum" />
              <SmallBtn icon={MessageCircle} label="Chat" />
              <SmallBtn icon={Flag} label="Report" />
              <SmallBtn icon={Plus} label="Feature" />
           </div>
        </RibbonGroup>

        <RibbonGroup label="Resources">
           <div className="grid grid-cols-2 gap-1 w-28">
              <SmallBtn icon={HelpCircle} label="FAQ" />
              <SmallBtn icon={Play} label="Guide" />
              <SmallBtn icon={Code} label="API" />
              <SmallBtn icon={Cpu} label="Dev" />
           </div>
        </RibbonGroup>

        <RibbonGroup label="About">
           <SmallBtn icon={Lightbulb} label="Tips" />
           <SmallBtn icon={Layout} label="Templ" />
           <SmallBtn icon={FileText} label="Notes" />
           <SmallBtn icon={Scale} label="Legal" />
           <SmallBtn icon={Info} label="About" />
        </RibbonGroup>
     </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Home': return renderHomeRibbon();
      case 'Insert': return renderInsertRibbon();
      case 'Page Layout': return renderPageLayoutRibbon();
      case 'Formulas': return renderFormulasRibbon();
      case 'Data': return renderDataRibbon();
      case 'Review': return renderReviewRibbon();
      case 'View': return renderViewRibbon();
      case 'Help': return renderHelpRibbon();
      default: return renderHomeRibbon();
    }
  };

  return (
    <div className="h-40 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 flex items-center px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] pb-2 transition-all duration-200">
      <div className="flex w-full min-w-max h-full pt-2 justify-between">
         {renderContent()}
      </div>
    </div>
  );
};

export default Ribbon;
