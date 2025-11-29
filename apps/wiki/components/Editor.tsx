import React, { useState, useRef, useEffect } from 'react';
import { Block, WikiPage } from '../types';
import { 
  GripVertical, Plus, Trash2, Wand2, Image as ImageIcon, 
  Quote, CheckSquare, Minus, AlertCircle, Type 
} from 'lucide-react';
import { improveBlock, generateContent } from '../services/geminiService';

interface EditorProps {
  page: WikiPage;
  onUpdate: (updatedPage: WikiPage) => void;
}

const Editor: React.FC<EditorProps> = ({ page, onUpdate }) => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState<string | null>(null);
  const blockRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  useEffect(() => {
    if (activeBlockId && blockRefs.current[activeBlockId]) {
      const el = blockRefs.current[activeBlockId];
      if (el) autoResize(el);
    }
  }, [activeBlockId, page.blocks]);

  const updateBlock = (id: string, updates: Partial<Block>) => {
    const newBlocks = page.blocks.map(b => b.id === id ? { ...b, ...updates } : b);
    onUpdate({ ...page, blocks: newBlocks });
  };

  const addBlock = (afterId: string, type: Block['type'] = 'paragraph') => {
    const newBlock: Block = { id: `block-${Date.now()}`, type, content: '' };
    const index = page.blocks.findIndex(b => b.id === afterId);
    const newBlocks = [...page.blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onUpdate({ ...page, blocks: newBlocks });
    setActiveBlockId(newBlock.id);
  };

  const removeBlock = (id: string) => {
    if (page.blocks.length <= 1) return;
    const newBlocks = page.blocks.filter(b => b.id !== id);
    onUpdate({ ...page, blocks: newBlocks });
  };

  const handleKeyDown = (e: React.KeyboardEvent, block: Block) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock(block.id);
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      removeBlock(block.id);
    }
  };

  const handleAiGenerate = async (blockId: string) => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
        const generatedText = await generateContent(aiPrompt, page.blocks);
        updateBlock(blockId, { content: generatedText });
        setShowAiInput(null);
        setAiPrompt('');
    } catch (e) {
        alert('Failed to generate content. Check API Key.');
    } finally {
        setIsAiLoading(false);
    }
  };

  const renderBlockContent = (block: Block) => {
    // Styles mapping
    const baseInput = "w-full resize-none bg-transparent outline-none overflow-hidden block transition-colors";
    
    switch (block.type) {
      case 'h1':
        return <textarea {...commonProps(block)} className={`${baseInput} text-4xl font-bold text-gray-900 mt-8 mb-4 leading-tight`} placeholder="Heading 1" />;
      case 'h2':
        return <textarea {...commonProps(block)} className={`${baseInput} text-2xl font-semibold text-gray-800 mt-6 mb-3 leading-snug`} placeholder="Heading 2" />;
      case 'h3':
        return <textarea {...commonProps(block)} className={`${baseInput} text-xl font-medium text-gray-800 mt-4 mb-2`} placeholder="Heading 3" />;
      case 'callout':
        return (
          <div className="flex gap-3 bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-md my-2">
            <span className="text-xl select-none">💡</span>
            <textarea {...commonProps(block)} className={`${baseInput} text-gray-700`} placeholder="Add a callout..." />
          </div>
        );
      case 'quote':
        return (
          <div className="flex gap-3 my-3">
             <div className="w-1 bg-gray-300 rounded-full"></div>
             <textarea {...commonProps(block)} className={`${baseInput} text-xl italic text-gray-600 font-serif`} placeholder="Empty quote..." />
          </div>
        );
      case 'code':
        return (
          <div className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-md p-4 my-2 relative group-block">
             <div className="absolute right-2 top-2 text-xs text-gray-400 select-none">code</div>
             <textarea {...commonProps(block)} className={`${baseInput} text-gray-800`} placeholder="// Write code..." />
          </div>
        );
      case 'bullet':
        return (
          <div className="flex items-start">
             <span className="mr-2.5 text-gray-400 text-lg leading-6">•</span>
             <textarea {...commonProps(block)} className={`${baseInput} text-gray-700 leading-7 min-h-[1.75rem]`} placeholder="List item" />
          </div>
        );
      case 'check':
        return (
          <div className="flex items-start">
             <div 
               className={`mt-1.5 mr-3 w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-colors ${block.checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-gray-400'}`}
               onClick={() => updateBlock(block.id, { checked: !block.checked })}
             >
                {block.checked && <CheckSquare size={10} className="text-white" />}
             </div>
             <textarea 
                {...commonProps(block)} 
                className={`${baseInput} text-gray-700 leading-7 min-h-[1.75rem] ${block.checked ? 'line-through text-gray-400' : ''}`} 
                placeholder="To-do item" 
             />
          </div>
        );
      case 'divider':
        return (
          <div className="py-4 flex items-center justify-center cursor-default group-hover:bg-gray-50 rounded" onClick={() => setActiveBlockId(block.id)}>
             <div className="h-px bg-gray-200 w-full"></div>
          </div>
        );
      default: // paragraph
        return <textarea {...commonProps(block)} className={`${baseInput} text-gray-700 leading-7 min-h-[1.75rem]`} placeholder="Type '/' for commands" />;
    }
  };

  const commonProps = (block: Block) => ({
    ref: (el: HTMLTextAreaElement | null) => { blockRefs.current[block.id] = el; },
    value: block.content,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateBlock(block.id, { content: e.target.value });
      autoResize(e.target);
    },
    onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block),
    onFocus: () => setActiveBlockId(block.id),
    rows: 1,
  });

  return (
    <div className="w-full pb-32 bg-white min-h-full">
        {/* Cover Image */}
        <div className="group relative w-full h-64 bg-gray-100 overflow-hidden border-b border-gray-100">
            {page.coverImage ? (
                <img src={page.coverImage} className="w-full h-full object-cover" alt="Cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-pink-50 to-blue-50 opacity-50" />
            )}
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 shadow-sm hover:bg-white transition-all">
                    Change cover
                 </button>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-12 relative -mt-12 z-10">
            {/* Icon */}
            <div className="group relative w-24 h-24 mb-4">
                 <div className="w-full h-full text-7xl flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                     {page.icon}
                 </div>
            </div>

            {/* Title */}
            <input
                value={page.title}
                onChange={(e) => onUpdate({ ...page, title: e.target.value })}
                placeholder="Untitled"
                className="text-5xl font-bold w-full border-none outline-none bg-transparent placeholder-gray-300 text-gray-900 mb-8"
            />

            {/* Editor Blocks */}
            <div className="space-y-1">
                {page.blocks.map((block) => (
                    <div key={block.id} className="group/block relative flex items-start -ml-12 pl-12">
                        {/* Drag Handle & Controls */}
                        <div className="absolute left-0 top-1.5 opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center space-x-0.5 pr-2 select-none">
                             <button className="p-1 hover:bg-gray-100 rounded text-gray-400 cursor-grab active:cursor-grabbing">
                                <GripVertical size={14} />
                             </button>
                             <button 
                                onClick={() => addBlock(block.id)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400"
                             >
                                <Plus size={14} />
                             </button>
                        </div>

                        {/* AI Input for this block */}
                        <div className="flex-1 relative">
                            {showAiInput === block.id && (
                                 <div className="mb-2 p-1 bg-white border border-purple-200 ring-4 ring-purple-50/50 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-1 z-20 absolute w-full -top-14 left-0">
                                    <div className="flex items-center gap-2 p-1">
                                        <div className="bg-purple-100 p-1.5 rounded-md">
                                            <Wand2 className="text-purple-600" size={14} />
                                        </div>
                                        <input 
                                            autoFocus
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAiGenerate(block.id);
                                                if (e.key === 'Escape') setShowAiInput(null);
                                            }}
                                            placeholder="Ask AI to write, summarize, or explain..."
                                            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400 h-8"
                                        />
                                        {isAiLoading && <div className="text-xs text-purple-600 font-medium px-2">Generating...</div>}
                                    </div>
                                 </div>
                            )}

                            {renderBlockContent(block)}

                             {/* Block Actions */}
                             {(activeBlockId === block.id || block.content === '') && (
                                 <div className="absolute -right-8 top-1 opacity-0 group-hover/block:opacity-100 transition-opacity flex flex-col gap-1">
                                     <button 
                                        onClick={() => setShowAiInput(showAiInput === block.id ? null : block.id)}
                                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                        title="Ask AI"
                                     >
                                        <Wand2 size={14} />
                                     </button>
                                 </div>
                             )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom spacer for comfortable typing */}
            <div 
                className="h-40 cursor-text"
                onClick={() => addBlock(page.blocks[page.blocks.length - 1].id)}
            ></div>
        </div>
    </div>
  );
};

export default Editor;