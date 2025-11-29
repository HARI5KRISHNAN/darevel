import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List, 
  ListOrdered,
  Undo, 
  Redo, 
  Printer, 
  Paintbrush, 
  Type, 
  Highlighter, 
  Link, 
  MessageSquare, 
  Image, 
  ChevronDown, 
  Minus, 
  Plus, 
  Clock, 
  Check,
  Palette,
  PanelTop,
  PanelBottom
} from 'lucide-react';

interface ToolbarProps {
  onFormat: (command: string, value?: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onFormat }) => {
  // Simple state to track active buttons for visual feedback
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  
  // Font Size State
  const [fontSize, setFontSize] = useState(11);
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const fontSizeRef = useRef<HTMLDivElement>(null);
  
  // Color Picker State
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  // Highlight Picker State
  const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false);
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
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) {
        setIsFontSizeOpen(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false);
      }
      if (highlightPickerRef.current && !highlightPickerRef.current.contains(event.target as Node)) {
        setIsHighlightPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormatClick = (cmd: string, arg?: string) => {
    onFormat(cmd, arg);
    
    // Toggle visual active state for togglable commands
    if (['bold', 'italic', 'underline', 'strikeThrough', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].includes(cmd)) {
       setActiveFormats(prev => {
         const newSet = new Set(prev);
         if (newSet.has(cmd)) newSet.delete(cmd);
         else {
            // Handle mutex groups like alignment
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
    
    // Map approx pixel sizes to 1-7 scale for document.execCommand('fontSize')
    // 1=8pt, 2=10pt, 3=12pt, 4=14pt, 5=18pt, 6=24pt, 7=36pt+
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

  const incrementFontSize = (dir: number) => {
     let next = fontSize;
     const idx = fontSizes.indexOf(fontSize);
     
     if (idx !== -1) {
        // If current size is in our preset list, move to next/prev
        if (dir > 0 && idx < fontSizes.length - 1) next = fontSizes[idx + 1];
        if (dir < 0 && idx > 0) next = fontSizes[idx - 1];
     } else {
        // If current size is custom (e.g. 11), find where it fits
        if (dir > 0) {
            const found = fontSizes.find(s => s > fontSize);
            if (found) next = found;
        } else {
            const found = [...fontSizes].reverse().find(s => s < fontSize);
            if (found) next = found;
        }
     }
     
     if (next !== fontSize) {
        updateFontSize(next);
     }
  };

  const handleColorSelect = (color: string) => {
    onFormat('foreColor', color);
    setIsColorPickerOpen(false);
  };

  const handleHighlightSelect = (color: string) => {
    onFormat('backColor', color);
    setIsHighlightPickerOpen(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
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
    if (e.target) {
        e.target.value = '';
    }
  };

  const separator = <div className="w-px h-5 bg-slate-700/50 mx-2 self-center" />;
  
  const Btn = ({ 
    icon: Icon, 
    cmd, 
    arg, 
    active = false,
    label,
    onClick
  }: { 
    icon?: any, 
    cmd?: string, 
    arg?: string, 
    active?: boolean,
    label?: string,
    onClick?: () => void
  }) => {
    const isActive = active || (cmd && activeFormats.has(cmd));

    return (
      <button 
        onClick={() => onClick ? onClick() : (cmd && handleFormatClick(cmd, arg))}
        className={`
          relative group p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 border
          outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
          ${isActive 
            ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-[inset_0_1px_4px_rgba(0,0,0,0.2)]' 
            : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-blue-300 hover:border-slate-700 hover:shadow-sm active:scale-95 active:bg-slate-800/80'
          }
        `}
        title={label || cmd}
      >
        {Icon && <Icon size={18} strokeWidth={2} className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-110 group-hover:drop-shadow-[0_0_2px_rgba(59,130,246,0.5)]'}`} />}
        {label && <span className="text-sm font-medium">{label}</span>}
      </button>
    );
  };

  const Dropdown = ({ label, width = "w-24" }: { label: string, width?: string }) => (
    <button className={`
      flex items-center justify-between px-3 py-1.5 ${width} h-9 
      bg-slate-800 hover:bg-slate-700 hover:border-slate-600 hover:text-blue-300
      border border-slate-700 rounded-lg text-[13px] text-slate-300 
      transition-all duration-200 shadow-sm group active:scale-95
    `}>
      <span className="truncate transition-colors">{label}</span>
      <ChevronDown size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
    </button>
  );

  return (
    <div className="flex items-center flex-wrap gap-1 px-4 py-3 bg-[#0f172a] border-b border-slate-800/80 shadow-sm z-10">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />

      <Btn icon={Undo} cmd="undo" />
      <Btn icon={Redo} cmd="redo" />
      
      {separator}

      <Dropdown label="Normal text" width="w-32" />
      <Dropdown label="Calibri" width="w-28" />
      
      <div className="flex items-center gap-1" ref={fontSizeRef}>
         <button 
            onClick={() => incrementFontSize(-1)}
            className="p-2 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
         >
            <Minus size={14} />
         </button>
         
         <div className="relative">
            <button 
              onClick={() => setIsFontSizeOpen(!isFontSizeOpen)}
              className="flex items-center justify-center w-12 h-9 border border-slate-700 bg-slate-800/50 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-700 hover:border-slate-600 hover:text-blue-300 transition-all"
            >
               {fontSize}
            </button>
            
            {isFontSizeOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-16 max-h-64 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 flex flex-col p-1 scrollbar-thin scrollbar-thumb-slate-600">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => updateFontSize(size)}
                    className={`
                      w-full px-2 py-1.5 text-sm text-center rounded transition-colors
                      ${fontSize === size ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
         </div>

         <button 
            onClick={() => incrementFontSize(1)}
            className="p-2 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
         >
            <Plus size={14} />
         </button>
      </div>

      {separator}

      <div className="flex items-center bg-slate-800/30 rounded-lg p-1 border border-slate-700/50 gap-0.5">
        <Btn icon={Bold} cmd="bold" />
        <Btn icon={Italic} cmd="italic" />
        <Btn icon={Underline} cmd="underline" />
        <Btn icon={Strikethrough} cmd="strikeThrough" />
        
        {/* Text Color Picker */}
        <div className="relative" ref={colorPickerRef}>
           <Btn 
             icon={Palette} 
             label="" 
             active={isColorPickerOpen}
             onClick={() => setIsColorPickerOpen(!isColorPickerOpen)} 
           />
           {isColorPickerOpen && (
             <div className="absolute top-full left-0 mt-2 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 flex flex-col gap-2 w-48 animate-in fade-in zoom-in-95 duration-100">
               <span className="text-xs font-semibold text-slate-400 px-1">Text Color</span>
               <div className="grid grid-cols-6 gap-1">
                 {presetColors.map((color) => (
                   <button
                     key={color}
                     onClick={() => handleColorSelect(color)}
                     className="w-6 h-6 rounded border border-slate-600 hover:scale-110 hover:border-white transition-all shadow-sm"
                     style={{ backgroundColor: color }}
                     title={color}
                   />
                 ))}
               </div>
             </div>
           )}
        </div>

        {/* Highlight Color Picker */}
        <div className="relative" ref={highlightPickerRef}>
           <Btn 
             icon={Highlighter} 
             label="" 
             active={isHighlightPickerOpen}
             onClick={() => setIsHighlightPickerOpen(!isHighlightPickerOpen)} 
           />
           {isHighlightPickerOpen && (
             <div className="absolute top-full left-0 mt-2 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 flex flex-col gap-2 w-48 animate-in fade-in zoom-in-95 duration-100">
               <span className="text-xs font-semibold text-slate-400 px-1">Highlight Color</span>
               <div className="grid grid-cols-6 gap-1">
                 {presetColors.map((color) => (
                   <button
                     key={color}
                     onClick={() => handleHighlightSelect(color)}
                     className="w-6 h-6 rounded border border-slate-600 hover:scale-110 hover:border-white transition-all shadow-sm"
                     style={{ backgroundColor: color }}
                     title={color}
                   />
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>
      
      <Btn icon={Link} label="" />
      <Btn icon={MessageSquare} label="" />
      <Btn icon={Image} label="" onClick={handleImageClick} />
      <Btn icon={PanelTop} cmd="insertHeader" label="" />
      <Btn icon={PanelBottom} cmd="insertFooter" label="" />

      {separator}

      <div className="flex items-center bg-slate-800/30 rounded-lg p-1 border border-slate-700/50 gap-0.5">
        <Btn icon={AlignLeft} cmd="justifyLeft" active={activeFormats.has('justifyLeft')} />
        <Btn icon={AlignCenter} cmd="justifyCenter" active={activeFormats.has('justifyCenter')} />
        <Btn icon={AlignRight} cmd="justifyRight" active={activeFormats.has('justifyRight')} />
        <Btn icon={AlignJustify} cmd="justifyFull" active={activeFormats.has('justifyFull')} />
      </div>

      {separator}
      
      <Btn icon={List} cmd="insertUnorderedList" />
      <Btn icon={ListOrdered} cmd="insertOrderedList" />
      
    </div>
  );
};

export default Toolbar;