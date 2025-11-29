import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Superscript, Subscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent,
  Undo, Redo, Printer, FilePlus, FolderOpen, Save, FileDown, 
  Type, Highlighter, Palette, 
  Image as ImageIcon, Table, Box, Smile, 
  PanelTop, PanelBottom, Link, Code, Calculator,
  ZoomIn, ZoomOut, Maximize, Eye, Grid, Layout,
  Cpu, SpellCheck, BarChart2, Lock,
  Puzzle, Play, HelpCircle, Book, Keyboard,
  ChevronDown, Minus, Plus, Search, Scissors, Copy, Clipboard,
  Trash2, RefreshCw, LayoutTemplate, FileText,
  MousePointer2, History, RotateCcw, RotateCw, Reply, Wand2, 
  TextCursorInput, Heading, BoxSelect, User, Replace, Regex, 
  Minimize, Monitor, BookOpen, Columns, Ruler, MessageSquare, 
  MessageCircle, Moon, Sun, Focus, MonitorPlay, PieChart, 
  Camera, PenTool, Sticker, Hash, Split, FileType, Quote, 
  CheckSquare, ListVideo, Anchor, Sparkles, PaintBucket, 
  Baseline, CaseSensitive, Rotate3d, Square, Bot, Languages, 
  PenLine, FileSignature, Shield, Mic, Activity, GitCompare, 
  Terminal, Clock, Download, Database, Figma, Slack, Cloud, 
  Code2, Webhook, Key, TableProperties, Calendar, StickyNote, 
  PlayCircle, Youtube, Lightbulb, Flag, MessageSquarePlus, 
  Users, FileClock, Info, Globe, AlertCircle, FileX, Eraser, 
  Move, Check, X, FileCheck, Sidebar, Braces, TerminalSquare,
  MoreHorizontal, FileSymlink, ImagePlus, FileImage, Files,
  Settings, Share2, Printer as PrintIcon, ShieldCheck, FileKey,
  Globe2, MessageCircleQuestion, LifeBuoy, Pointer, StepBack as StepBackIcon, Github as GithubIcon,
  WrapText, ImageMinus
} from 'lucide-react';

// Custom icons to replace local definitions if needed, ensuring consistent imports
const StepBack = StepBackIcon;
const Github = GithubIcon;

interface RibbonProps {
  activeTab: string;
  onFormat: (command: string, value?: string) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const RibbonGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
  <div className="flex flex-col h-full px-6 border-r-2 border-slate-200 dark:border-slate-600 last:border-0 min-w-max flex-auto justify-center group relative py-2">
    <div className="flex-1 flex items-center justify-center gap-4 px-2">
      {children}
    </div>
    <div className="text-[11px] font-bold text-slate-500 text-center uppercase tracking-wider mt-2 pb-1 opacity-80">
      {label}
    </div>
  </div>
);

const Ribbon: React.FC<RibbonProps> = ({ activeTab, onFormat, isDarkMode, onToggleTheme }) => {
  // --- Local State for interactive elements ---
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState(11);
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false);
  
  const fontSizeRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const highlightPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fontSizes = [8, 10, 12, 14, 18, 24, 36, 48];
  const presetColors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) setIsFontSizeOpen(false);
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) setIsColorPickerOpen(false);
      if (highlightPickerRef.current && !highlightPickerRef.current.contains(event.target as Node)) setIsHighlightPickerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Handlers ---

  const handleFormatClick = (cmd: string, arg?: string) => {
    onFormat(cmd, arg);
    // Toggle active state visualization
    if (['bold', 'italic', 'underline', 'strikeThrough', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'subscript', 'superscript'].includes(cmd)) {
       setActiveFormats(prev => {
         const newSet = new Set(prev);
         if (newSet.has(cmd)) newSet.delete(cmd);
         else {
            if (cmd.startsWith('justify')) {
               newSet.delete('justifyLeft');
               newSet.delete('justifyCenter');
               newSet.delete('justifyRight');
               newSet.delete('justifyFull');
            }
            newSet.add(cmd);
         }
         return newSet;
       });
    }
  };

  const updateFontSize = (size: number) => {
    setFontSize(size);
    setIsFontSizeOpen(false);
    let val = '3';
    if (size <= 8) val = '1';
    else if (size <= 10) val = '2';
    else if (size <= 12) val = '3';
    else if (size <= 14) val = '4';
    else if (size <= 18) val = '5';
    else if (size <= 24) val = '6';
    else val = '7';
    onFormat('fontSize', val);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onFormat('insertImage', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // --- UI Components ---

  const BigBtn = ({ icon: Icon, label, onClick, active, cmd, title }: any) => (
    <button 
      onClick={() => onClick ? onClick() : (cmd && handleFormatClick(cmd))}
      className={`
        flex flex-col items-center justify-center h-[88px] w-[84px] rounded-xl gap-2 transition-all flex-shrink-0
        ${active 
          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
        }
      `}
      title={title || label}
    >
      <Icon size={32} strokeWidth={1.5} />
      <span className="text-[12px] font-medium text-center leading-tight px-1 line-clamp-2">{label}</span>
    </button>
  );

  const SmallBtn = ({ icon: Icon, onClick, active, cmd, title }: any) => (
    <button 
      onClick={() => onClick ? onClick() : (cmd && handleFormatClick(cmd))}
      className={`
        p-2 rounded-lg transition-all flex-shrink-0
        ${active 
          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
        }
      `}
      title={title}
    >
      <Icon size={20} strokeWidth={1.5} />
    </button>
  );

  const LabelBtn = ({ label, icon: Icon, onClick, cmd, title }: any) => (
    <button 
      onClick={() => onClick ? onClick() : (cmd && handleFormatClick(cmd))}
      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer text-[13px] text-slate-600 dark:text-slate-300 w-full whitespace-nowrap"
      title={title || label}
    >
       {Icon && <Icon size={16} />} {label}
    </button>
  );

  // --- Ribbon Content Renderers ---

  const renderFileRibbon = () => (
    <>
      <RibbonGroup label="Document">
        <BigBtn icon={FilePlus} label="New" title="Create a blank document" />
        <BigBtn icon={LayoutTemplate} label="New from Template" cmd="newTemplate" title="Create a document from a pre-designed template" />
        <BigBtn icon={FolderOpen} label="Open" title="Open an existing document" />
        <BigBtn icon={Save} label="Save" cmd="save" title="Save current document (Ctrl+S)" />
        <BigBtn icon={FileText} label="Rename" title="Rename this document" />
      </RibbonGroup>
      <RibbonGroup label="Share & Export">
         <BigBtn icon={FileDown} label="Export" title="Export to PDF, Word, or other formats" />
         <BigBtn icon={PrintIcon} label="Print" cmd="print" title="Print this document (Ctrl+P)" />
         <BigBtn icon={Share2} label="Share" title="Share with people and groups" />
      </RibbonGroup>
      <RibbonGroup label="Security">
         <BigBtn icon={ShieldCheck} label="Protect" title="Restrict editing permissions" />
         <BigBtn icon={FileKey} label="Password" title="Encrypt with password" />
      </RibbonGroup>
      <RibbonGroup label="Version">
        <div className="flex flex-col gap-1 w-32">
           <LabelBtn label="History" icon={History} title="View version history" />
           <LabelBtn label="Save Ver" icon={Save} title="Name current version" />
           <LabelBtn label="Restore" icon={RotateCcw} title="Restore to previous version" />
        </div>
      </RibbonGroup>
    </>
  );

  const renderEditRibbon = () => (
    <>
      <RibbonGroup label="Clipboard">
         <div className="flex flex-col gap-1">
            <BigBtn icon={Clipboard} label="Paste" cmd="paste" title="Paste content (Ctrl+V)" />
         </div>
         <div className="flex flex-col gap-1 w-28">
            <LabelBtn label="Cut" icon={Scissors} onClick={() => handleFormatClick('cut')} title="Cut selection (Ctrl+X)" />
            <LabelBtn label="Copy" icon={Copy} onClick={() => handleFormatClick('copy')} title="Copy selection (Ctrl+C)" />
            <LabelBtn label="Copy Fmt" icon={PaintBucket} title="Copy formatting" />
            <LabelBtn label="Clear Fmt" icon={Eraser} cmd="removeFormat" title="Clear all formatting" />
         </div>
      </RibbonGroup>
      <RibbonGroup label="Editing">
        <BigBtn icon={Undo} label="Undo" cmd="undo" title="Undo last action (Ctrl+Z)" />
        <BigBtn icon={Redo} label="Redo" cmd="redo" title="Redo last action (Ctrl+Y)" />
        <div className="flex flex-col gap-1">
           <SmallBtn icon={RotateCcw} title="Repeat Action" />
           <SmallBtn icon={Trash2} title="Restore recently deleted" />
           <SmallBtn icon={Wand2} title="Auto-Correct settings" />
           <SmallBtn icon={Lightbulb} title="Show suggestions" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Selection">
         <BigBtn icon={LayoutTemplate} label="Select All" cmd="selectAll" title="Select entire document (Ctrl+A)" />
         <div className="grid grid-cols-2 gap-1 w-24">
           <SmallBtn icon={TextCursorInput} title="Select Paragraph" />
           <SmallBtn icon={Heading} title="Select Heading" />
           <SmallBtn icon={BoxSelect} title="Select Section" />
           <SmallBtn icon={MousePointer2} title="Select Objects" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Find & Replace">
        <BigBtn icon={Search} label="Find" title="Find text (Ctrl+F)" />
        <BigBtn icon={Replace} label="Replace" title="Find and replace (Ctrl+H)" />
        <div className="flex flex-col gap-1 w-32">
           <LabelBtn label="In Comments" icon={MessageSquare} title="Search within comments" />
           <LabelBtn label="By Author" icon={User} title="Filter edits by author" />
           <LabelBtn label="Advanced" icon={Regex} title="Advanced search options" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="History">
         <BigBtn icon={History} label="Recent" title="Show recent edits" />
         <BigBtn icon={StepBack} label="Jump Last" title="Jump to last cursor position" />
      </RibbonGroup>
    </>
  );

  const renderViewRibbon = () => (
    <>
      <RibbonGroup label="Zoom">
         <BigBtn icon={ZoomIn} label="Zoom In" title="Increase zoom" />
         <BigBtn icon={ZoomOut} label="Zoom Out" title="Decrease zoom" />
         <div className="grid grid-cols-2 gap-1 w-28">
            <LabelBtn label="100%" title="Reset zoom to 100%" />
            <LabelBtn label="50%" title="Set zoom to 50%" />
            <LabelBtn label="Fit Page" title="Fit whole page in window" />
            <LabelBtn label="Fit Width" title="Fit page width to window" />
         </div>
      </RibbonGroup>
      <RibbonGroup label="Layout">
         <BigBtn icon={FileText} label="Print" active title="Print Layout View" />
         <BigBtn icon={Layout} label="Web" title="Web Layout View" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={BookOpen} title="Reading Mode" />
            <SmallBtn icon={Monitor} title="Immersive Mode" />
            <SmallBtn icon={Columns} title="Two Page View" />
            <SmallBtn icon={Grid} title="Grid View" />
         </div>
      </RibbonGroup>
      <RibbonGroup label="Show/Hide">
         <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-56">
           <label className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap" title="Toggle ruler visibility">
             <input type="checkbox" defaultChecked className="rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-blue-500 scale-110" /> Ruler
           </label>
           <label className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap" title="Toggle gridlines">
             <input type="checkbox" className="rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-blue-500 scale-110" /> Gridlines
           </label>
           <label className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap" title="Toggle document outline">
             <input type="checkbox" defaultChecked className="rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-blue-500 scale-110" /> Outline
           </label>
           <label className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap" title="Toggle comments panel">
             <input type="checkbox" className="rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-blue-500 scale-110" /> Comments
           </label>
           <label className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap" title="Toggle chat panel">
             <input type="checkbox" className="rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-blue-500 scale-110" /> Chat
           </label>
           <label className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap" title="Toggle status bar">
             <input type="checkbox" defaultChecked className="rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-blue-500 scale-110" /> Status Bar
           </label>
           <label className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap" title="Toggle text boundaries">
             <input type="checkbox" className="rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-blue-500 scale-110" /> Bounds
           </label>
           <label className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300 cursor-pointer whitespace-nowrap" title="Toggle page thumbnails">
             <input type="checkbox" className="rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-blue-500 scale-110" /> Thumbs
           </label>
         </div>
      </RibbonGroup>
      <RibbonGroup label="Modes">
         <BigBtn icon={Moon} label="Dark" onClick={() => onToggleTheme && !isDarkMode && onToggleTheme()} active={isDarkMode} title="Switch to Dark Mode" />
         <BigBtn icon={Sun} label="Light" onClick={() => onToggleTheme && isDarkMode && onToggleTheme()} active={!isDarkMode} title="Switch to Light Mode" />
         <BigBtn icon={Focus} label="Focus" title="Focus Mode" />
         <BigBtn icon={Maximize} label="Full" title="Fullscreen Mode" />
      </RibbonGroup>
    </>
  );

  const renderInsertRibbon = () => (
    <>
      <RibbonGroup label="Media">
        <BigBtn icon={ImageIcon} label="Image" onClick={() => fileInputRef.current?.click()} title="Insert an image from file" />
        <BigBtn icon={Table} label="Table" title="Insert a table" />
        <div className="grid grid-cols-3 gap-1">
           <SmallBtn icon={Smile} title="Insert Icon" />
           <SmallBtn icon={Box} title="Insert Shape" />
           <SmallBtn icon={PieChart} title="Insert Chart" />
           <SmallBtn icon={Camera} title="Take Screenshot" />
           <SmallBtn icon={PenTool} title="Draw" />
           <SmallBtn icon={Sticker} title="Add Sticker" />
           <SmallBtn icon={ImagePlus} title="Insert Illustration" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Page">
        <BigBtn icon={PanelTop} label="Header" cmd="insertHeader" title="Add or edit header" />
        <BigBtn icon={PanelBottom} label="Footer" cmd="insertFooter" title="Add or edit footer" />
        <div className="flex flex-col gap-1">
           <SmallBtn icon={Hash} title="Page Number" />
           <SmallBtn icon={Split} title="Page Break" />
           <SmallBtn icon={FileType} title="Section Break" />
           <SmallBtn icon={FileImage} title="Cover Page" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Blocks">
        <BigBtn icon={Quote} label="Quote" title="Insert quote block" />
        <div className="flex flex-col gap-1">
           <SmallBtn icon={MessageSquare} title="Callout Box" />
           <SmallBtn icon={CheckSquare} title="Checklist" />
           <SmallBtn icon={ListVideo} title="Timeline" />
           <SmallBtn icon={List} title="Table of Contents" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Links & Code">
        <BigBtn icon={Link} label="Link" title="Insert Link (Ctrl+K)" />
        <BigBtn icon={Code} label="Code" title="Insert Code Block" />
        <div className="flex flex-col gap-1">
           <SmallBtn icon={Calculator} title="Insert Math Equation" />
           <SmallBtn icon={Anchor} title="Insert Anchor" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Smart Objects">
         <BigBtn icon={Sparkles} label="Smart Table" title="Insert AI Smart Table" />
         <BigBtn icon={Wand2} label="Auto Summary" title="Generate Summary Block" />
      </RibbonGroup>
    </>
  );

  const renderFormatRibbon = () => (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      
      <RibbonGroup label="Font">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 mb-1">
             <button className="flex items-center justify-between w-36 px-3 py-2 text-xs bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300" title="Font Family">
               <span>Calibri</span> <ChevronDown size={14} />
             </button>
             <div className="relative" ref={fontSizeRef}>
               <button onClick={() => setIsFontSizeOpen(!isFontSizeOpen)} className="flex items-center justify-between w-16 px-3 py-2 text-xs bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300" title="Font Size">
                  <span>{fontSize}</span> <ChevronDown size={14} />
               </button>
               {isFontSizeOpen && (
                 <div className="absolute top-full left-0 w-16 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 z-50 max-h-48 overflow-y-auto shadow-lg rounded-lg">
                    {fontSizes.map(s => <div key={s} onClick={() => updateFontSize(s)} className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs cursor-pointer text-slate-800 dark:text-slate-200">{s}</div>)}
                 </div>
               )}
             </div>
          </div>
          <div className="flex gap-1">
             <SmallBtn icon={Bold} cmd="bold" active={activeFormats.has('bold')} title="Bold (Ctrl+B)" />
             <SmallBtn icon={Italic} cmd="italic" active={activeFormats.has('italic')} title="Italic (Ctrl+I)" />
             <SmallBtn icon={Underline} cmd="underline" active={activeFormats.has('underline')} title="Underline (Ctrl+U)" />
             <SmallBtn icon={Strikethrough} cmd="strikeThrough" active={activeFormats.has('strikeThrough')} title="Strikethrough" />
             
             {/* Text Color */}
             <div className="relative" ref={colorPickerRef}>
               <SmallBtn icon={Palette} active={isColorPickerOpen} onClick={() => setIsColorPickerOpen(!isColorPickerOpen)} title="Text Color" />
               {isColorPickerOpen && (
                 <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 grid grid-cols-5 gap-1 w-40 rounded-lg">
                    {presetColors.map(c => (
                      <div key={c} onClick={() => { onFormat('foreColor', c); setIsColorPickerOpen(false); }} className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform" style={{backgroundColor: c}} />
                    ))}
                 </div>
               )}
             </div>

             {/* Highlight Color */}
             <div className="relative" ref={highlightPickerRef}>
               <SmallBtn icon={Highlighter} active={isHighlightPickerOpen} onClick={() => setIsHighlightPickerOpen(!isHighlightPickerOpen)} title="Highlight Color" />
               {isHighlightPickerOpen && (
                 <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 grid grid-cols-5 gap-1 w-40 rounded-lg">
                    {presetColors.map(c => (
                      <div key={c} onClick={() => { onFormat('backColor', c); setIsHighlightPickerOpen(false); }} className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform" style={{backgroundColor: c}} />
                    ))}
                 </div>
               )}
             </div>
             
             <SmallBtn icon={Eraser} cmd="removeFormat" title="Clear Formatting" />
          </div>
          <div className="flex gap-1 mt-0.5">
             <SmallBtn icon={Subscript} cmd="subscript" active={activeFormats.has('subscript')} title="Subscript" />
             <SmallBtn icon={Superscript} cmd="superscript" active={activeFormats.has('superscript')} title="Superscript" />
             <SmallBtn icon={CaseSensitive} title="Small Caps" />
             <SmallBtn icon={Baseline} title="Strike" />
          </div>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Paragraph">
        <div className="flex flex-col gap-2 items-start">
           <div className="flex gap-1">
             <SmallBtn icon={AlignLeft} cmd="justifyLeft" active={activeFormats.has('justifyLeft')} title="Align Left (Ctrl+L)" />
             <SmallBtn icon={AlignCenter} cmd="justifyCenter" active={activeFormats.has('justifyCenter')} title="Align Center (Ctrl+E)" />
             <SmallBtn icon={AlignRight} cmd="justifyRight" active={activeFormats.has('justifyRight')} title="Align Right (Ctrl+R)" />
             <SmallBtn icon={AlignJustify} cmd="justifyFull" active={activeFormats.has('justifyFull')} title="Justify (Ctrl+J)" />
             <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />
             <SmallBtn icon={Indent} cmd="indent" title="Increase Indent" />
             <SmallBtn icon={Outdent} cmd="outdent" title="Decrease Indent" />
           </div>
           <div className="flex gap-1">
             <SmallBtn icon={List} cmd="insertUnorderedList" title="Bulleted List" />
             <SmallBtn icon={ListOrdered} cmd="insertOrderedList" title="Numbered List" />
             <SmallBtn icon={CheckSquare} title="Checklist" />
             <SmallBtn icon={MoreHorizontal} title="Line Spacing" />
             <SmallBtn icon={Square} title="Borders" />
           </div>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Image Layout">
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
                <SmallBtn icon={AlignLeft} onClick={() => onFormat('imgAlignLeft')} title="Align Image Left" />
                <SmallBtn icon={AlignCenter} onClick={() => onFormat('imgAlignCenter')} title="Align Image Center" />
                <SmallBtn icon={AlignRight} onClick={() => onFormat('imgAlignRight')} title="Align Image Right" />
            </div>
            <div className="flex gap-1">
                <SmallBtn icon={WrapText} onClick={() => onFormat('imgFloatLeft')} title="Wrap Text (Float Left)" />
                <SmallBtn icon={Minimize} onClick={() => onFormat('imgNone')} title="Inline with Text" />
                <SmallBtn icon={Maximize} onClick={() => onFormat('imgBreak')} title="Break Text" />
            </div>
          </div>
      </RibbonGroup>

      <RibbonGroup label="Styles">
         <div className="grid grid-cols-2 gap-2 w-48">
            <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs rounded-lg text-left hover:bg-slate-300 dark:hover:bg-slate-700 border border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-800 dark:text-slate-300" title="Apply Normal Style">Normal</button>
            <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs rounded-lg text-left font-bold hover:bg-slate-300 dark:hover:bg-slate-700 border border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-800 dark:text-slate-300" title="Apply Heading 1">Heading 1</button>
            <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs rounded-lg text-left font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 border border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-800 dark:text-slate-300" title="Apply Heading 2">Heading 2</button>
            <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs rounded-lg text-left italic hover:bg-slate-300 dark:hover:bg-slate-700 border border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-800 dark:text-slate-300" title="Apply Title Style">Title</button>
            <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs rounded-lg text-left text-blue-600 dark:text-blue-400 hover:bg-slate-300 dark:hover:bg-slate-700 border border-transparent hover:border-slate-400 dark:hover:border-slate-500" title="Apply Subtitle Style">Subtitle</button>
            <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs rounded-lg text-left hover:bg-slate-300 dark:hover:bg-slate-700 border border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-800 dark:text-slate-300" title="Manage Custom Styles">Custom...</button>
         </div>
      </RibbonGroup>

      <RibbonGroup label="Advanced">
         <BigBtn icon={Type} label="Drop Cap" title="Add Drop Cap" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={Rotate3d} title="Text Rotation" />
            <SmallBtn icon={Square} title="Borders & Shading" />
            <SmallBtn icon={PaintBucket} title="Background Shading" />
         </div>
      </RibbonGroup>
    </>
  );

  const renderToolsRibbon = () => (
    <>
      <RibbonGroup label="AI Tools">
        <BigBtn icon={Cpu} label="Assistant" title="Open AI Assistant" />
        <BigBtn icon={Bot} label="Rewrite" title="Rewrite selected text" />
        <div className="grid grid-cols-2 gap-1 w-28">
           <SmallBtn icon={FileText} title="Summarize text" />
           <SmallBtn icon={Languages} title="Translate text" />
           <SmallBtn icon={Wand2} title="Fix Grammar" />
           <SmallBtn icon={PenLine} title="Adjust Tone" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Review">
        <BigBtn icon={SpellCheck} label="Spelling" title="Check Spelling" />
        <BigBtn icon={BarChart2} label="Count" title="Word Count" />
        <div className="flex flex-col gap-1">
           <SmallBtn icon={MessageSquare} title="Comments" />
           <SmallBtn icon={Activity} title="Track Changes" />
           <SmallBtn icon={Check} title="Accept Change" />
           <SmallBtn icon={X} title="Reject Change" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Security">
        <BigBtn icon={Lock} label="Protect" title="Protect Document" />
        <BigBtn icon={Key} label="Password" title="Set Password" />
        <BigBtn icon={Shield} label="Restrict" title="Restrict Editing" />
      </RibbonGroup>
      <RibbonGroup label="Utilities">
         <BigBtn icon={Mic} label="Dictate" title="Voice Typing" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={FileSignature} title="Digital Signature" />
            <SmallBtn icon={GitCompare} title="Compare Documents" />
            <SmallBtn icon={Clock} title="Activity Log" />
         </div>
      </RibbonGroup>
      <RibbonGroup label="Automation">
         <BigBtn icon={Terminal} label="Script" title="Run Script" />
         <BigBtn icon={Calendar} label="Schedule" title="Schedule Task" />
      </RibbonGroup>
    </>
  );

  const renderExtensionsRibbon = () => (
    <>
      <RibbonGroup label="Add-ons">
        <BigBtn icon={Puzzle} label="Manage" title="Manage Add-ons" />
        <BigBtn icon={Download} label="Install" title="Install Add-ons" />
        <div className="flex flex-col gap-1">
           <SmallBtn icon={Trash2} title="Remove Add-on" />
           <SmallBtn icon={RefreshCw} title="Update Add-on" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Integrations">
        <BigBtn icon={Github} label="GitHub" title="GitHub Integration" />
        <div className="grid grid-cols-3 gap-1">
           <SmallBtn icon={Database} title="Notion" />
           <SmallBtn icon={Figma} title="Figma" />
           <SmallBtn icon={Slack} title="Slack" />
           <SmallBtn icon={Cloud} title="Google Drive" />
           <SmallBtn icon={Cloud} title="OneDrive" />
           <SmallBtn icon={Box} title="Dropbox" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Automation">
        <BigBtn icon={Code2} label="Scripts" title="Apps Script" />
        <BigBtn icon={Webhook} label="Webhooks" title="Webhooks" />
        <div className="flex flex-col gap-1">
           <SmallBtn icon={TerminalSquare} title="Developer Console" />
           <SmallBtn icon={Key} title="API Keys" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Workspace">
         <BigBtn icon={TableProperties} label="Sheets" title="Open Sheets" />
         <BigBtn icon={MonitorPlay} label="Slides" title="Open Slides" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={Calendar} title="Calendar" />
            <SmallBtn icon={StickyNote} title="Keep Notes" />
         </div>
      </RibbonGroup>
    </>
  );

  const renderHelpRibbon = () => (
    <>
      <RibbonGroup label="Support">
        <BigBtn icon={HelpCircle} label="Help Ctr" title="Help Center" />
        <BigBtn icon={Book} label="Guide" title="User Guide" />
        <div className="flex flex-col gap-1">
           <SmallBtn icon={FileText} title="Documentation" />
           <SmallBtn icon={Keyboard} title="Keyboard Shortcuts" />
           <SmallBtn icon={Flag} title="Getting Started" />
           <SmallBtn icon={User} title="Account Info" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Learning">
         <BigBtn icon={PlayCircle} label="Tutorials" title="Interactive Tutorials" />
         <BigBtn icon={Youtube} label="Videos" title="Video Guides" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={Lightbulb} title="Tips & Tricks" />
            <SmallBtn icon={CheckSquare} title="Best Practices" />
         </div>
      </RibbonGroup>
      <RibbonGroup label="Feedback">
         <BigBtn icon={MessageSquarePlus} label="Report" title="Report an Issue" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={MessageCircleQuestion} title="Request Feature" />
            <SmallBtn icon={Users} title="Community Forum" />
            <SmallBtn icon={FileClock} title="Changelog" />
         </div>
      </RibbonGroup>
      <RibbonGroup label="System">
         <BigBtn icon={Info} label="About" title="About Darevel Docs" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={RefreshCw} title="Check for Updates" />
            <SmallBtn icon={Globe2} title="Language" />
            <SmallBtn icon={AlertCircle} title="System Status" />
            <SmallBtn icon={LifeBuoy} title="Accessibility" />
         </div>
      </RibbonGroup>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'File': return renderFileRibbon();
      case 'Edit': return renderEditRibbon();
      case 'View': return renderViewRibbon();
      case 'Insert': return renderInsertRibbon();
      case 'Format': return renderFormatRibbon();
      case 'Tools': return renderToolsRibbon();
      case 'Extensions': return renderExtensionsRibbon();
      case 'Help': return renderHelpRibbon();
      default: return renderFormatRibbon();
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