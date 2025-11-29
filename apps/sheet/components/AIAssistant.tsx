import React, { useState } from 'react';
import { Sparkles, Send, Copy, Check, Wand2, FileText, Loader2 } from 'lucide-react';
import { generateWritingAssistance } from '../services/geminiService';

interface AIAssistantProps {
  documentContext: string;
  selectedText: string;
  onInsert: (text: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ documentContext, selectedText, onInsert }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResult(null);
    try {
      const text = await generateWritingAssistance(prompt, documentContext);
      setResult(text);
    } catch (error) {
      setResult("Error generating response.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizeSelection = async () => {
    if (!selectedText) return;
    setIsLoading(true);
    setResult(null);
    try {
      const text = await generateWritingAssistance(
        "Please provide a concise summary of the following text.", 
        selectedText
      );
      setResult(text);
    } catch (error) {
      setResult("Error generating summary.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 transition-colors">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Sparkles size={18} />
          <h2 className="font-semibold text-sm tracking-wide">Darevel AI</h2>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        
        {/* Selection Context Actions */}
        {selectedText ? (
           <div className="bg-blue-50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-300 text-sm font-medium">
                 <FileText size={16} />
                 <span>Selection detected</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic line-clamp-2 border-l-2 border-slate-300 dark:border-slate-600 pl-2">
                 "{selectedText}"
              </p>
              <button 
                onClick={handleSummarizeSelection}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-md text-sm font-medium transition-colors"
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={14} />
                    Summarize Selection
                  </>
                )}
              </button>
           </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
            <p className="font-medium mb-2 text-slate-800 dark:text-slate-200">I can help you:</p>
            <div className="grid grid-cols-2 gap-2">
              {['Summarize', 'Rewrite', 'Expand', 'Fix Grammar'].map(action => (
                <button 
                  key={action}
                  onClick={() => setPrompt(`${action} the document...`)}
                  className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 rounded py-1.5 transition-colors text-left px-2 shadow-sm dark:shadow-none"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Generated Result</span>
              <div className="flex space-x-1">
                 <button 
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button 
                  onClick={() => onInsert(result)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md transition-colors"
                  title="Insert into document"
                >
                  <Wand2 size={14} />
                </button>
              </div>
            </div>
            <div className="prose prose-sm prose-slate dark:prose-invert text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
              {result}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Darevel AI..."
            className="w-full p-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200 resize-none text-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute bottom-3 right-3 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;