import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { SearchBar } from './components/SearchBar';
import { SearchCommandPalette } from './components/SearchCommandPalette';
import { SearchPage } from './pages/SearchPage';
import { LayoutGrid, Bell, Settings, UserCircle } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
       <SearchCommandPalette />
       
       <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-center h-16 gap-8">
             <Link to="/" className="flex items-center gap-2 shrink-0">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                 <LayoutGrid className="w-5 h-5 text-white" />
               </div>
               <span className="font-bold text-xl tracking-tight hidden sm:block">Darevel Search Global</span>
             </Link>

             <div className="flex-1 max-w-2xl">
               <SearchBar />
             </div>

             <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:block">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center cursor-pointer">
                   <UserCircle className="w-6 h-6 text-slate-400" />
                </div>
             </div>
           </div>
         </div>
       </header>

       {children}
    </div>
  );
};

const Dashboard = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-blue-100 dark:border-slate-700">
      <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Welcome back, User</h2>
      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
        Access all your tools from one place. Try searching for "Financials", "Project Alpha", or press <kbd className="bg-white dark:bg-slate-700 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-600 font-mono text-sm">Ctrl+K</kbd> to get started.
      </p>
    </div>
  </div>
);

const App = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
