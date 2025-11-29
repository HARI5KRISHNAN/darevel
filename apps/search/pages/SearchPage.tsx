import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchStore } from '../store/searchStore';
import { SearchResultCard } from '../components/SearchResultCard';
import { SearchCategory, SearchResult } from '../types';
import { Filter, SlidersHorizontal, ChevronDown, ChevronRight } from 'lucide-react';

const CATEGORIES: { id: SearchCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'chat', label: 'Chat' },
  { id: 'mail', label: 'Mail' },
  { id: 'docs', label: 'Docs' },
  { id: 'files', label: 'Files' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'wiki', label: 'Wiki' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'users', label: 'People' },
];

const ResultsSection = ({ title, results, query }: { title: string, results: SearchResult[], query: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!results || results.length === 0) return null;

  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full group mb-3 text-left focus:outline-none select-none"
      >
        <div className="mr-2 p-1 rounded-md text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
           {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h2>
        <span className="ml-3 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 border border-slate-200 dark:border-slate-700">
           {results.length}
        </span>
        <div className="flex-1 ml-4 h-px bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors" />
      </button>

      {isOpen && (
        <div className="space-y-4 pl-2 md:pl-0 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.map((result) => (
             <SearchResultCard 
                key={result.id} 
                result={result} 
                highlight={query} 
             />
           ))}
        </div>
      )}
    </div>
  );
};

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const { 
    results, 
    isLoading, 
    runSearch, 
    setQuery, 
    query, 
    filters, 
    setFilters 
  } = useSearchStore();

  // Sync URL query to store
  useEffect(() => {
    if (q && q !== query) {
      setQuery(q);
      runSearch(q);
    }
  }, [q]);

  const handleTabChange = (cat: SearchCategory) => {
    setFilters({ category: cat });
  };

  // Grouping logic
  const groupedResults = useMemo(() => {
     if (filters.category !== 'all') return null;
     
     const groups: Partial<Record<SearchCategory, SearchResult[]>> = {};
     results.forEach(r => {
         if (!groups[r.type]) groups[r.type] = [];
         groups[r.type]!.push(r);
     });
     return groups;
  }, [results, filters.category]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Search Results {query && <span>for "{query}"</span>}
            </h1>
            
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
               {CATEGORIES.map((cat) => (
                 <button
                   key={cat.id}
                   onClick={() => handleTabChange(cat.id)}
                   className={`
                      whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${filters.category === cat.id 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
                   `}
                 >
                   {cat.label}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-8">
           <div>
             <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-4">
               <Filter className="w-4 h-4" /> Filters
             </h3>
             
             {/* Date Filter */}
             <div className="space-y-3">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Posted</label>
               <div className="space-y-1">
                 {['any', 'today', 'week', 'month', 'year'].map((range) => (
                    <label key={range} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:text-blue-600">
                      <input 
                        type="radio" 
                        name="dateRange"
                        className="text-blue-600 focus:ring-blue-500"
                        checked={filters.dateRange === range}
                        onChange={() => setFilters({ dateRange: range as any })}
                      />
                      <span className="capitalize">{range === 'any' ? 'Any Time' : `Past ${range}`}</span>
                    </label>
                 ))}
               </div>
             </div>
             
             <div className="h-px bg-slate-200 dark:bg-slate-800 my-6" />

             {/* Sort Filter */}
             <div className="space-y-3">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort By</label>
               <select 
                 className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 value={filters.sortBy}
                 onChange={(e) => setFilters({ sortBy: e.target.value as any })}
               >
                 <option value="relevance">Relevance</option>
                 <option value="newest">Newest First</option>
               </select>
             </div>
           </div>
        </aside>

        {/* Mobile Filters Toggle (Visible only on small screens) */}
        <div className="lg:hidden">
          <button className="flex items-center gap-2 w-full justify-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 text-sm font-medium">
             <SlidersHorizontal className="w-4 h-4" />
             Filter & Sort Results
             <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Main Results Area */}
        <main className="flex-1 min-h-[500px]">
           {isLoading ? (
             <div className="space-y-6">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex gap-4 p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                     <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                     <div className="flex-1 space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                     </div>
                  </div>
                ))}
             </div>
           ) : results.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <Filter className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No results found</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                  We couldn't find anything matching "{query}" in {filters.category !== 'all' ? filters.category : 'all categories'}.
                </p>
                <button 
                  onClick={() => setFilters({ category: 'all' })}
                  className="mt-6 text-blue-600 font-medium hover:underline"
                >
                  Clear filters
                </button>
             </div>
           ) : (
             <div className="space-y-6">
               <div className="flex items-center justify-between text-sm text-slate-500 border-b border-transparent pb-2">
                 <p>Found {results.length} results</p>
                 <p className="text-xs font-mono opacity-60">{(Math.random() * 0.5 + 0.1).toFixed(2)}s</p>
               </div>

               {/* Render Groups or Flat List */}
               {filters.category === 'all' && groupedResults ? (
                  <div>
                      {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                        const catResults = groupedResults[cat.id];
                        if (!catResults) return null;
                        return (
                            <ResultsSection 
                                key={cat.id} 
                                title={cat.label} 
                                results={catResults} 
                                query={query} 
                            />
                        );
                      })}
                  </div>
               ) : (
                 <div className="space-y-4">
                   {results.map((result) => (
                     <SearchResultCard 
                        key={result.id} 
                        result={result} 
                        highlight={query} 
                     />
                   ))}
                 </div>
               )}
               
               {/* Pagination Mock */}
               <div className="flex justify-center pt-8 pb-4 border-t border-slate-100 dark:border-slate-800 mt-8">
                  <nav className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white font-medium shadow">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">3</button>
                    <span className="text-slate-400 px-2">...</span>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">8</button>
                  </nav>
               </div>
             </div>
           )}
        </main>

      </div>
    </div>
  );
};
