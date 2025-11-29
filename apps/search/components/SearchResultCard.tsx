import React from 'react';
import { SearchResult } from '../types';
import { 
  FileText, MessageSquare, Mail, Folder, CheckSquare, 
  Calendar, User, BookOpen, Hash
} from 'lucide-react';

interface Props {
  result: SearchResult;
  highlight?: string;
  compact?: boolean;
  onClick?: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'docs': return <FileText className="w-5 h-5 text-blue-500" />;
    case 'chat': return <MessageSquare className="w-5 h-5 text-green-500" />;
    case 'mail': return <Mail className="w-5 h-5 text-purple-500" />;
    case 'files': return <Folder className="w-5 h-5 text-yellow-500" />;
    case 'tasks': return <CheckSquare className="w-5 h-5 text-red-500" />;
    case 'calendar': return <Calendar className="w-5 h-5 text-orange-500" />;
    case 'users': return <User className="w-5 h-5 text-indigo-500" />;
    case 'wiki': return <BookOpen className="w-5 h-5 text-teal-500" />;
    default: return <Hash className="w-5 h-5 text-gray-500" />;
  }
};

const HighlightedText = ({ text, highlight }: { text: string; highlight?: string }) => {
  if (!highlight || !text) return <span>{text}</span>;
  
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5 font-medium">{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};

export const SearchResultCard: React.FC<Props> = ({ result, highlight, compact, onClick }) => {
  if (compact) {
    return (
      <div 
        onClick={onClick}
        className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer rounded-lg group transition-colors"
      >
        <div className="shrink-0 p-2 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700">
          {getIcon(result.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            <HighlightedText text={result.title} highlight={highlight} />
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-2">
            <span className="capitalize">{result.type}</span>
            {result.metadata?.author && <span>• {result.metadata.author}</span>}
            {result.metadata?.status && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase font-bold
                    ${result.metadata.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                `}>
                    {result.metadata.status}
                </span>
            )}
          </p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 text-xs text-slate-400">
          Press ↵
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow cursor-pointer group">
      <div className="shrink-0">
         <div className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
            {result.metadata?.avatar ? (
                <img src={result.metadata.avatar} alt="" className="w-full h-full rounded-lg object-cover" />
            ) : getIcon(result.type)}
         </div>
      </div>
      
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 group-hover:underline truncate pr-4">
            <HighlightedText text={result.title} highlight={highlight} />
          </h3>
          <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
            {new Date(result.timestamp).toLocaleDateString()}
          </span>
        </div>

        {result.snippet && (
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            <HighlightedText text={result.snippet} highlight={highlight} />
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
           <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md capitalize font-medium">
             {result.type}
           </span>
           {result.metadata?.folderPath && (
             <span className="flex items-center gap-1 font-mono">
               <Folder className="w-3 h-3" /> {result.metadata.folderPath}
             </span>
           )}
           {result.metadata?.emailFrom && (
             <span>From: {result.metadata.emailFrom}</span>
           )}
        </div>
      </div>
    </div>
  );
};
