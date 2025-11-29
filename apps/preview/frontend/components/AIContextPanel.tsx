import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, User, X } from 'lucide-react';
import { FileMetadata } from '../types';
import { generateFileAnalysis } from '../services/geminiService';

interface AIContextPanelProps {
  file: FileMetadata;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const AIContextPanel: React.FC<AIContextPanelProps> = ({ file, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMessages([]);
    void handleInitialAnalysis(file);
  }, [isOpen, file]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleInitialAnalysis = async (currentFile: FileMetadata) => {
    setIsLoading(true);
    const summary = await generateFileAnalysis(currentFile, 'Summarize this document in 3 bullet points.');
    setMessages([
      {
        id: 'init-1',
        role: 'assistant',
        text: `Here is a summary of **${currentFile.name}**:\n\n${summary}`,
        timestamp: new Date(),
      },
    ]);
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const aiResponse = await generateFileAnalysis(file, userMsg.text);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: aiResponse,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="w-[400px] border-l border-slate-200 bg-white shadow-2xl flex flex-col h-full absolute right-0 top-0 z-40">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <div className="flex items-center space-x-2 text-slate-800">
          <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
            <Sparkles size={18} />
          </div>
          <h3 className="font-semibold text-base">AI Assistant</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50 custom-scrollbar" ref={scrollRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mb-1 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                {msg.role === 'user' ? <User size={12} className="text-white" /> : <Bot size={12} className="text-white" />}
              </div>
              <div
                className={`px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {msg.text.split('**').map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="flex flex-row items-end gap-2 max-w-[85%]">
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mb-1">
                <Bot size={12} className="text-white" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-2">
                <Loader2 size={14} className="animate-spin text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Analyzing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <textarea
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm transition-all outline-none resize-none custom-scrollbar"
            placeholder="Ask a question about this file..."
            rows={1}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            disabled={isLoading}
            style={{ minHeight: '46px', maxHeight: '120px' }}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-slate-400">AI can make mistakes. Verify important info.</span>
        </div>
      </div>
    </div>
  );
};

export default AIContextPanel;
