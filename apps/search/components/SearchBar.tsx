import React from 'react';
import { Search } from 'lucide-react';
import { useSearchStore } from '../store/searchStore';

export const SearchBar = () => {
  const { setPaletteOpen } = useSearchStore();

  return (
    <button
      onClick={() => setPaletteOpen(true)}
      className="group relative flex items-center gap-3 w-full bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded-lg px-4 py-2.5 transition-all text-slate-500 hover:bg-white dark:hover:bg-slate-900 shadow-sm"
    >
      <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
      <span className="text-sm font-medium truncate">Search across Darevel...</span>
      <div className="ml-auto flex items-center gap-1 text-xs text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 shadow-sm">
        <span className="text-[10px]">Ctrl</span>
        <span>K</span>
      </div>
    </button>
  );
};
