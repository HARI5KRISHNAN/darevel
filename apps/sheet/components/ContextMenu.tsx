
import React, { useEffect, useRef } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, 
  AlignCenter, AlignRight, Eraser, Code, Check, 
  ChevronRight, Scissors, Copy, Clipboard, ChevronDown,
  Palette
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onFormat: (command: string, value?: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onFormat }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // Close on scroll as well to prevent floating issues
    const handleScroll = () => onClose();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  // Prevent menu from going off-screen
  const adjustPosition = () => {
    // Basic adjustment logic (can be expanded)
    const menuWidth = 260; 
    const menuHeight = 400;
    let finalX = x;
    let finalY = y;

    if (x + menuWidth > window.innerWidth) finalX = x - menuWidth;
    if (y + menuHeight > window.innerHeight) finalY = y - menuHeight;

    return { top: finalY, left: finalX };
  };

  const style = adjustPosition();

  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', 
    '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'
  ];

  const sizes = [10, 11, 12, 13, 14, 18, 24];

  return (
    <div 
      ref={menuRef}
      className="fixed z-[100] flex gap-2 animate-in fade-in zoom-in-95 duration-100 origin-top-left font-sans text-slate-300"
      style={style}
    >
      {/* Main Panel */}
      <div className="w-64 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Row 1: Quick Toggles */}
        <div className="flex items-center justify-between p-2 bg-slate-800/50 border-b border-slate-700">
          <div className="flex gap-1">
             <button onClick={() => onFormat('bold')} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Bold"><Bold size={16} /></button>
             <button onClick={() => onFormat('italic')} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Italic"><Italic size={16} /></button>
             <button onClick={() => onFormat('underline')} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Underline"><Underline size={16} /></button>
             <button onClick={() => onFormat('strikeThrough')} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Strikethrough"><Strikethrough size={16} /></button>
          </div>
          <div className="w-px h-4 bg-slate-700"></div>
          <button onClick={() => onFormat('removeFormat')} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400" title="Clear Formatting"><Eraser size={16} /></button>
        </div>

        {/* Section: Selectors */}
        <div className="p-3 space-y-3 border-b border-slate-700/50">
           {/* Style Select */}
           <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Style</label>
              <button className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 transition-colors">
                 <span>Normal</span>
                 <ChevronDown size={12} />
              </button>
           </div>

           {/* Typeface Select */}
           <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Typeface</label>
              <button className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 transition-colors">
                 <span>Calibri</span>
                 <ChevronDown size={12} />
              </button>
           </div>
        </div>

        {/* Section: Text Size */}
        <div className="p-3 border-b border-slate-700/50">
           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Text Size</label>
           <div className="flex flex-wrap gap-1">
              {sizes.map(size => (
                 <button 
                   key={size}
                   onClick={() => {
                     // Approximate mapping for execCommand
                     let val = '3';
                     if(size <= 10) val='2';
                     if(size >= 14) val='4';
                     if(size >= 18) val='5';
                     if(size >= 24) val='7';
                     onFormat('fontSize', val);
                   }}
                   className={`
                     w-8 h-7 flex items-center justify-center rounded text-xs border border-slate-700 
                     ${size === 13 ? 'bg-slate-600 text-white border-slate-500' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}
                   `}
                 >
                    {size}
                 </button>
              ))}
           </div>
        </div>

        {/* Section: Colors */}
        <div className="p-3">
           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Color</label>
           <div className="flex items-center gap-2">
              {colors.map(c => (
                 <button 
                    key={c}
                    onClick={() => onFormat('foreColor', c)}
                    className="w-5 h-5 rounded-full border border-slate-600 hover:scale-110 hover:border-white transition-all"
                    style={{ backgroundColor: c }}
                 />
              ))}
              <button 
                onClick={() => onFormat('foreColor', '#ffffff')} // Assuming dark mode reset
                className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center text-slate-400 hover:text-white hover:border-white ml-auto"
              >
                <Palette size={12} />
              </button>
           </div>
        </div>

      </div>

      {/* Side Actions Panel (Floating Right like in image) */}
      <div className="w-40 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 h-fit">
         
         <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-700/50">
             <div className="flex gap-0.5 bg-slate-800 rounded p-0.5">
                <button onClick={() => onFormat('justifyLeft')} className="p-1 hover:bg-slate-600 rounded text-slate-400"><AlignLeft size={14} /></button>
                <button onClick={() => onFormat('justifyCenter')} className="p-1 hover:bg-slate-600 rounded text-slate-400"><AlignCenter size={14} /></button>
                <button onClick={() => onFormat('justifyRight')} className="p-1 hover:bg-slate-600 rounded text-slate-400"><AlignRight size={14} /></button>
             </div>
         </div>

         <div className="flex flex-col">
            <button className="px-3 py-1.5 text-xs text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center justify-between group">
               <span>Cut</span> <span className="text-[10px] text-slate-500 group-hover:text-blue-200">⌘X</span>
            </button>
            <button className="px-3 py-1.5 text-xs text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center justify-between group">
               <span>Copy</span> <span className="text-[10px] text-slate-500 group-hover:text-blue-200">⌘C</span>
            </button>
            <button onClick={() => onFormat('paste')} className="px-3 py-1.5 text-xs text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center justify-between group">
               <span>Paste</span> <span className="text-[10px] text-slate-500 group-hover:text-blue-200">⌘V</span>
            </button>
            
            <div className="h-px bg-slate-700 my-1 mx-2"></div>

            <button className="px-3 py-1.5 text-xs text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-2">
               <span className="w-4 flex justify-center"><Code size={12} /></span> Inline Code
            </button>
            <button className="px-3 py-1.5 text-xs text-left text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                <span className="w-4 flex justify-center"><Scissors size={12} /></span> Clear Styles
            </button>
         </div>
      </div>
    </div>
  );
};

export default ContextMenu;
