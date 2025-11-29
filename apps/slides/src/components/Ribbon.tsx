
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
  WrapText, ImageMinus, Layers, Smartphone, Aperture, Cast, Framer, Music, Film,
  ArrowRight, CreditCard, Droplet, QrCode, Network, Stamp, Volume2, Waves, 
  Tornado, Spline, Crosshair, Coffee, Subtitles, ScrollText, CheckCircle, 
  XCircle, EyeOff, Magnet, Bug, ArrowUp, ArrowDown, ArrowUpCircle, 
  ArrowDownCircle, PlusCircle, MinusCircle, RefreshCcw, TrendingUp, TrendingDown,
  Repeat, MonitorOff, Sliders, MousePointer, Library, LayoutGrid, CheckCheck,
  Video, ChevronRight, File
} from 'lucide-react';

// Custom icons
const StepBack = StepBackIcon;
const Github = GithubIcon;

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
  const [fontSize, setFontSize] = useState(24);
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  
  const fontSizeRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fontSizes = [12, 14, 18, 24, 32, 40, 48, 60, 72, 96];
  const presetColors = ['#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) setIsFontSizeOpen(false);
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) setIsColorPickerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormatClick = (cmd: string, arg?: string) => {
    onFormat(cmd, arg);
    if (['bold', 'italic', 'underline', 'strikeThrough', 'justifyLeft', 'justifyCenter', 'justifyRight'].includes(cmd)) {
       setActiveFormats(prev => {
         const newSet = new Set(prev);
         if (newSet.has(cmd)) newSet.delete(cmd);
         else newSet.add(cmd);
         return newSet;
       });
    }
  };

  const updateFontSize = (size: number) => {
    setFontSize(size);
    setIsFontSizeOpen(false);
    let val = '3';
    if (size >= 24) val = '5';
    if (size >= 36) val = '6';
    if (size >= 48) val = '7';
    onFormat('fontSize', val);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) onFormat('insertImage', event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // UI Components
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

  const SmallBtn = ({ icon: Icon, onClick, active, cmd, title, label }: any) => (
    <button 
      onClick={() => onClick ? onClick() : (cmd && handleFormatClick(cmd))}
      className={`
        p-2 rounded-lg transition-all flex-shrink-0 flex items-center justify-center gap-2
        ${active 
          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
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
            <div className="flex gap-1"><SmallBtn icon={PaintBucket} title="Format Painter" /><SmallBtn icon={Eraser} cmd="removeFormat" title="Clear Formatting" /></div>
         </div>
      </RibbonGroup>
      
      <RibbonGroup label="Slides">
         <BigBtn icon={Plus} label="New Slide" cmd="newSlide" title="Add New Slide" />
         <BigBtn icon={Layout} label="Layout" title="Change Slide Layout" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={RotateCcw} title="Reset" label="Reset" />
            <SmallBtn icon={Files} title="Duplicate Slide" label="Duplicate" />
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
                      {fontSizes.map(s => <div key={s} onClick={() => updateFontSize(s)} className="px-1 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-xs">{s}</div>)}
                   </div>
                 )}
              </div>
            </div>
            <div className="flex gap-1">
               <SmallBtn icon={Bold} cmd="bold" active={activeFormats.has('bold')} />
               <SmallBtn icon={Italic} cmd="italic" active={activeFormats.has('italic')} />
               <SmallBtn icon={Underline} cmd="underline" active={activeFormats.has('underline')} />
               <SmallBtn icon={Strikethrough} cmd="strikeThrough" active={activeFormats.has('strikeThrough')} />
               <SmallBtn icon={Palette} onClick={() => setIsColorPickerOpen(!isColorPickerOpen)} />
            </div>
         </div>
      </RibbonGroup>

      <RibbonGroup label="Paragraph">
         <div className="grid grid-cols-4 gap-1 w-32">
            <SmallBtn icon={AlignLeft} cmd="justifyLeft" />
            <SmallBtn icon={AlignCenter} cmd="justifyCenter" />
            <SmallBtn icon={AlignRight} cmd="justifyRight" />
            <SmallBtn icon={AlignJustify} cmd="justifyFull" />
            <SmallBtn icon={List} cmd="insertUnorderedList" />
            <SmallBtn icon={ListOrdered} cmd="insertOrderedList" />
            <SmallBtn icon={Indent} cmd="indent" />
            <SmallBtn icon={Outdent} cmd="outdent" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Drawing">
         <div className="grid grid-cols-3 gap-1 w-32">
            <SmallBtn icon={Box} title="Rectangle" />
            <SmallBtn icon={Smile} title="Shape" />
            <SmallBtn icon={ArrowRight} title="Arrow" />
            <SmallBtn icon={PaintBucket} title="Fill" />
            <SmallBtn icon={Square} title="Outline" />
            <SmallBtn icon={Layers} title="Effects" />
         </div>
      </RibbonGroup>
    </>
  );

  const renderInsertRibbon = () => (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      
      <RibbonGroup label="Media">
         <BigBtn icon={Type} label="Text Box" title="Insert Text Box" />
         <BigBtn icon={ImageIcon} label="Image" onClick={() => fileInputRef.current?.click()} title="Upload Image" />
         <div className="grid grid-cols-2 gap-1">
            <SmallBtn icon={ImagePlus} label="Stock" title="Stock Images" />
            <SmallBtn icon={Box} label="Shapes" title="Shapes" />
            <SmallBtn icon={Smile} label="Icons" title="Icons" />
            <SmallBtn icon={PenTool} label="Art" title="Illustrations" />
            <SmallBtn icon={BoxSelect} label="3D" title="3D Models" />
            <SmallBtn icon={BarChart2} label="Chart" title="Charts" />
            <SmallBtn icon={Network} label="Smart" title="Smart Diagrams" />
            <SmallBtn icon={Music} label="Audio" title="Audio" />
            <SmallBtn icon={Video} label="Video" title="Video" />
            <SmallBtn icon={Monitor} label="Rec" title="Screen Recording" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Page Elements">
         <BigBtn icon={Table} label="Table" title="Insert Table" />
         <div className="flex flex-col gap-1">
             <SmallBtn icon={Calculator} label="Eq" title="Equation" />
             <SmallBtn icon={Code} label="Code" title="Code Block" />
             <SmallBtn icon={QrCode} label="QR" title="QR Code" />
             <SmallBtn icon={StickyNote} label="Note" title="Sticky Note" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Advanced">
         <BigBtn icon={TableProperties} label="Smart Table" title="Smart Table" />
         <BigBtn icon={FileText} label="Summary" title="Auto Summary" />
         <BigBtn icon={Sparkles} label="AI Graphic" title="AI-Generated Graphic" />
      </RibbonGroup>
    </>
  );

  const renderDesignRibbon = () => (
    <>
      <RibbonGroup label="Themes">
         <BigBtn icon={Palette} label="Gallery" title="Theme Gallery" />
         <div className="flex gap-2 w-48 overflow-x-auto pb-1">
             {[1,2,3,4].map(i => (
               <div key={i} className="flex-shrink-0 w-16 h-10 bg-slate-200 dark:bg-slate-700 rounded border hover:border-blue-500 cursor-pointer relative overflow-hidden">
                 <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${i===1?'from-blue-500 to-cyan-400':i===2?'from-red-500 to-orange-400':i===3?'from-green-500 to-emerald-400':'from-purple-500 to-pink-400'}`}></div>
               </div>
             ))}
         </div>
      </RibbonGroup>

      <RibbonGroup label="Branding">
         <div className="grid grid-cols-2 gap-1">
            <SmallBtn icon={Droplet} label="Colors" title="Brand Colors" />
            <SmallBtn icon={Type} label="Fonts" title="Brand Fonts" />
            <SmallBtn icon={Layout} label="Layouts" title="Brand Layouts" />
            <SmallBtn icon={Plus} label="Custom" title="Add Custom Theme" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Canvas & Style">
         <BigBtn icon={Move} label="Slide Size" title="Slide Size" />
         <div className="grid grid-cols-2 gap-1">
            <SmallBtn icon={RotateCw} label="Orient" title="Orientation" />
            <SmallBtn icon={Sidebar} label="Margins" title="Margin Control" />
            <SmallBtn icon={Stamp} label="Mark" title="Watermark" />
            <SmallBtn icon={Square} label="Border" title="Border Styles" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="AI">
         <BigBtn icon={Bot} label="Designer" title="AI Designer Suggestions" />
         <SmallBtn icon={Layout} label="Auto Fix" title="Auto Layout Fix" />
         <SmallBtn icon={Wand2} label="Generate" title="Generate New Theme" />
      </RibbonGroup>
    </>
  );

  const renderTransitionsRibbon = () => (
     <>
       <RibbonGroup label="Transition Types">
          <div className="grid grid-cols-4 gap-1 w-64">
             <SmallBtn icon={Activity} title="Fade" label="Fade" />
             <SmallBtn icon={ArrowRight} title="Push" label="Push" />
             <SmallBtn icon={CreditCard} title="Wipe" label="Wipe" />
             <SmallBtn icon={Split} title="Split" label="Split" />
             <SmallBtn icon={ArrowUp} title="Float" label="Float" />
             <SmallBtn icon={ZoomIn} title="Zoom" label="Zoom" />
             <SmallBtn icon={Rotate3d} title="Flip" label="Flip" />
             <SmallBtn icon={Replace} title="Morph" label="Morph" />
             <SmallBtn icon={Box} title="Cube" label="Cube" />
             <SmallBtn icon={Waves} title="Ripple" label="Ripple" />
             <SmallBtn icon={Grid} title="Shatter" label="Shatter" />
             <SmallBtn icon={File} title="Page Curl" label="Curl" />
          </div>
       </RibbonGroup>

       <RibbonGroup label="Controls">
          <div className="grid grid-cols-2 gap-1">
             <SmallBtn icon={Clock} label="Duration" title="Transition Duration" />
             <SmallBtn icon={Volume2} label="Sound" title="Sound" />
             <SmallBtn icon={CheckSquare} label="Select" title="Apply to Selected" />
             <SmallBtn icon={CheckCheck} label="All" title="Apply to All" />
             <SmallBtn icon={Play} label="Preview" title="Preview Transition" />
             <SmallBtn icon={Timer} label="Delay" title="Transition Delay" />
             <SmallBtn icon={TrendingUp} label="Ease In" title="Smooth Start" />
             <SmallBtn icon={TrendingDown} label="Ease Out" title="Smooth End" />
          </div>
       </RibbonGroup>
     </>
  );

  const renderAnimationsRibbon = () => (
     <>
       <RibbonGroup label="Entrance">
          <div className="flex gap-1">
             <SmallBtn icon={PlusCircle} label="Fade In" />
             <SmallBtn icon={ZoomIn} label="Zoom" />
             <SmallBtn icon={ArrowUpCircle} label="Fly In" />
             <SmallBtn icon={ArrowUp} label="Pop" />
             <SmallBtn icon={Maximize} label="Stretch" />
          </div>
       </RibbonGroup>

       <RibbonGroup label="Emphasis">
          <div className="flex gap-1">
             <SmallBtn icon={Activity} label="Pulse" />
             <SmallBtn icon={RefreshCw} label="Spin" />
             <SmallBtn icon={Highlighter} label="Hilight" />
             <SmallBtn icon={Waves} label="Wave" />
          </div>
       </RibbonGroup>

       <RibbonGroup label="Exit">
          <div className="flex gap-1">
             <SmallBtn icon={MinusCircle} label="Fade Out" />
             <SmallBtn icon={ArrowDownCircle} label="Fly Out" />
             <SmallBtn icon={Minimize} label="Shrink" />
          </div>
       </RibbonGroup>

       <RibbonGroup label="Paths">
          <div className="flex gap-1">
             <SmallBtn icon={TrendingUp} label="Line" />
             <SmallBtn icon={Spline} label="Curve" />
             <SmallBtn icon={Tornado} label="Spiral" />
          </div>
       </RibbonGroup>

       <RibbonGroup label="Controls">
          <BigBtn icon={List} label="Pane" title="Animation Pane" />
          <div className="grid grid-cols-2 gap-1">
             <SmallBtn icon={MousePointer2} label="Click" title="Start On Click" />
             <SmallBtn icon={StepBack} label="Prev" title="Start With Previous" />
             <SmallBtn icon={StepForward} label="After" title="Start After Previous" />
             <SmallBtn icon={Clock} label="Delay" title="Animation Delay" />
          </div>
       </RibbonGroup>
     </>
  );

  const renderSlideShowRibbon = () => (
    <>
      <RibbonGroup label="Playback">
         <BigBtn icon={PlayCircle} label="Start" title="Start From Beginning" />
         <BigBtn icon={Play} label="Current" title="Start From Current Slide" />
         <div className="grid grid-cols-2 gap-1">
            <SmallBtn icon={Repeat} label="Auto" title="Auto Play" />
            <SmallBtn icon={RotateCw} label="Loop" title="Loop Slideshow" />
            <SmallBtn icon={Cast} label="Present" title="Presenter View" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Advanced">
         <div className="grid grid-cols-3 gap-1">
            <SmallBtn icon={Crosshair} label="Laser" title="Laser Pointer Mode" />
            <SmallBtn icon={PenTool} label="Draw" title="Annotation Tools" />
            <SmallBtn icon={MonitorOff} label="Black" title="Screen Blackout" />
            <SmallBtn icon={Coffee} label="Awake" title="Keep Display Awake" />
            <SmallBtn icon={Sliders} label="Controls" title="Show Media Controls" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Timing">
         <BigBtn icon={Mic} label="Rehearse" title="Rehearse Timings" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={FastForward} label="Advance" title="Auto Advance" />
            <SmallBtn icon={Clock} label="Duration" title="Slide Duration" />
            <SmallBtn icon={Timer} label="Timer" title="Show Countdown Timer" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Display">
         <div className="grid grid-cols-3 gap-1">
            <SmallBtn icon={Monitor} label="Dual" title="Dual Display Mode" />
            <SmallBtn icon={Sun} label="Contrast" title="High Contrast Mode" />
            <SmallBtn icon={Subtitles} label="Subs" title="Captioning ON/OFF" />
            <SmallBtn icon={MousePointer} label="Hide" title="Hide Pointer" />
            <SmallBtn icon={Grid} label="Thumbs" title="Show Thumbnails" />
            <SmallBtn icon={Music} label="BGM" title="Keep Audio Playing" />
         </div>
      </RibbonGroup>
    </>
  );

  const renderReviewRibbon = () => (
    <>
      <RibbonGroup label="Comments">
         <BigBtn icon={MessageSquarePlus} label="Add" title="Add Comment" />
         <div className="flex gap-1">
            <SmallBtn icon={FileText} label="Edit" title="Edit Comment" />
            <SmallBtn icon={Check} label="Resolve" title="Resolve Comment" />
            <SmallBtn icon={MessageSquare} label="Show" title="Show All Comments" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Proofing">
         <BigBtn icon={SpellCheck} label="Spell" title="Spell Check" />
         <div className="grid grid-cols-2 gap-1">
            <SmallBtn icon={ScrollText} label="Grammar" title="Grammar Check" />
            <SmallBtn icon={PenTool} label="Style" title="Style Suggestions" />
            <SmallBtn icon={Volume2} label="Read" title="Read Aloud" />
            <SmallBtn icon={GitCompare} label="Compare" title="Compare Slides" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Collaboration">
         <BigBtn icon={History} label="Track" title="Track Changes" />
         <div className="flex gap-1">
            <SmallBtn icon={CheckCircle} label="Accept" title="Accept Change" />
            <SmallBtn icon={XCircle} label="Reject" title="Reject Change" />
            <SmallBtn icon={Clock} label="History" title="Version History" />
            <SmallBtn icon={Users} label="People" title="Show Reviewer Names" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Security">
         <BigBtn icon={Lock} label="Protect" title="Protect Slide" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={Shield} label="Lock Edit" title="Lock Editing" />
            <SmallBtn icon={EyeOff} label="Restrict" title="Restrict Comments" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="AI">
         <BigBtn icon={Bot} label="Reviewer" title="AI Reviewer" />
         <SmallBtn icon={Sparkles} label="Improve" title="Improve Writing" />
         <SmallBtn icon={Copy} label="Dupes" title="Detect Duplicates" />
      </RibbonGroup>
    </>
  );

  const renderViewRibbon = () => (
    <>
      <RibbonGroup label="Zoom">
         <div className="grid grid-cols-4 gap-1">
            <SmallBtn icon={ZoomIn} label="In" />
            <SmallBtn icon={ZoomOut} label="Out" />
            <SmallBtn icon={Maximize} label="Fit" />
            <SmallBtn icon={BoxSelect} label="50%" />
            <SmallBtn icon={BoxSelect} label="75%" />
            <SmallBtn icon={BoxSelect} label="100%" />
            <SmallBtn icon={BoxSelect} label="150%" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Panels">
         <div className="grid grid-cols-3 gap-1">
            <SmallBtn icon={Grid} label="Thumbs" title="Show Thumbnails" />
            <SmallBtn icon={StickyNote} label="Notes" title="Show Notes" />
            <SmallBtn icon={List} label="Outline" title="Outline View" />
            <SmallBtn icon={Layers} label="Master" title="Master Slide View" />
            <SmallBtn icon={LayoutGrid} label="Grid" title="Grid View" />
            <SmallBtn icon={Library} label="Sorter" title="Slide Sorter" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Layout">
         <BigBtn icon={Ruler} label="Ruler" title="Ruler" />
         <div className="flex flex-col gap-1">
            <SmallBtn icon={Columns} label="Guides" title="Guides" />
            <SmallBtn icon={Grid} label="Gridlines" title="Gridlines" />
            <SmallBtn icon={Magnet} label="Snap" title="Snap to Grid" />
         </div>
      </RibbonGroup>

      <RibbonGroup label="Modes">
         <BigBtn icon={Monitor} label="Full" title="Fullscreen" />
         <SmallBtn icon={Eye} label="Focus" title="Focus Mode" />
         <SmallBtn icon={Moon} label="Dark" title="Dark/Light Switch" onClick={onToggleTheme} />
      </RibbonGroup>
    </>
  );

  const renderHelpRibbon = () => (
     <>
       <RibbonGroup label="Support">
          <BigBtn icon={HelpCircle} label="Help" title="Help Center" />
          <BigBtn icon={Book} label="Docs" title="Documentation" />
          <div className="flex flex-col gap-1">
             <SmallBtn icon={Keyboard} label="Keys" title="Keyboard Shortcuts" />
             <SmallBtn icon={Info} label="About" title="About" />
          </div>
       </RibbonGroup>
       <RibbonGroup label="Learning">
          <BigBtn icon={PlayCircle} label="Videos" title="Video Tutorials" />
          <SmallBtn icon={BookOpen} label="Guide" title="Quick Guide" />
       </RibbonGroup>
       <RibbonGroup label="Feedback">
          <BigBtn icon={Bug} label="Report" title="Report Issue" />
          <SmallBtn icon={Lightbulb} label="Feature" title="Request Feature" />
          <SmallBtn icon={MessageCircle} label="Contact" title="Contact Support" />
       </RibbonGroup>
     </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Home': return renderHomeRibbon();
      case 'Insert': return renderInsertRibbon();
      case 'Design': return renderDesignRibbon();
      case 'Transitions': return renderTransitionsRibbon();
      case 'Animations': return renderAnimationsRibbon();
      case 'Slide Show': return renderSlideShowRibbon();
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

// Icon placeholders (generic mapping for specific items not in standard set)
const Timer = Clock;
const StepForward = StepBackIcon; // Using StepBack as generic step icon
const FastForward = ChevronRight;

export default Ribbon;
