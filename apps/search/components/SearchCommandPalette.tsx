import React, { useEffect, useState, useRef } from 'react';
import { useSearchStore } from '../store/searchStore';
import { SearchResultCard } from './SearchResultCard';
import { Search, X, Command, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SearchCommandPalette = () => {
  const navigate = useNavigate();
  const { 
    isPaletteOpen, setPaletteOpen, 
    query, setQuery, 
    results, runSearch,
    recentSearches, addRecentSearch,
    isLoading
  } = useSearchStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPaletteOpen) runSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, isPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(!isPaletteOpen);
      }
      if (e.key === 'Escape' && isPaletteOpen) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen]);

  useEffect(() => {
    if (isPaletteOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
    }
  }, [isPaletteOpen]);

  useEffect(() => {
    const handleNav = (e: KeyboardEvent) => {
      if (!isPaletteOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results.length > 0 && results[selectedIndex]) {
           handleResultClick(results[selectedIndex]);
        } else if (query) {
           handleFullSearch();
        }
      }
    };
    window.addEventListener('keydown', handleNav);
    return () => window.removeEventListener('keydown', handleNav);
  }, [isPaletteOpen, results, selectedIndex, query]);

  const handleResultClick = (result: any) => {
    addRecentSearch(result.title);
    setPaletteOpen(false);
    navigate(result.url);
  };

  const handleFullSearch = () => {
    setPaletteOpen(false);
    addRecentSearch(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (!isPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setPaletteOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 dark:text-white placeholder:text-slate-400"
            placeholder="Search documents, tasks, people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex gap-2">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-500 font-mono">
              ESC
            </kbd>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          
          {isLoading ? (
             <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm">Searching Darevel Search Global...</p>
             </div>
          ) : (
            <>
              {results.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Results</div>
                  {results.map((result, idx) => (
                    <div 
                      key={result.id} 
                      className={`rounded-lg transition-colors ${idx === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800' : ''}`}
                    >
                      <SearchResultCard 
                        result={result} 
                        compact 
                        highlight={query}
                        onClick={() => handleResultClick(result)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {query === '' && recentSearches.length > 0 && (
                 <div className="space-y-1 mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent</div>
                    {recentSearches.map((term, i) => (
                      <button 
                        key={i}
                        onClick={() => { setQuery(term); }}
                        className="w-full text-left px-3 py-2 flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg group"
                      >
                         <Clock className="w-4 h-4 text-slate-400" />
                         <span>{term}</span>
                         <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-slate-400" />
                      </button>
                    ))}
                 </div>
              )}

              {query !== '' && results.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-500">No results found for "{query}"</p>
                  <button onClick={handleFullSearch} className="mt-2 text-blue-600 hover:underline text-sm font-medium">
                    Try detailed search page &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        {query && results.length > 0 && (
           <div 
             onClick={handleFullSearch}
             className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
           >
              <span>See all results for <strong>{query}</strong></span>
              <div className="flex items-center gap-1">
                 <Command className="w-3 h-3" />
                 <span>Enter</span>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};
