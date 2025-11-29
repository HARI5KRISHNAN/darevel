import React, { useState } from 'react';
import { WikiPage, WikiSpace } from '../types';
import { 
  ChevronRight, ChevronDown, Plus, 
  Layout, Star, Clock, MoreHorizontal
} from 'lucide-react';
import { getTeamMembers } from '../services/wikiService';

interface SidebarProps {
  spaces: WikiSpace[];
  pages: WikiPage[];
  activePageId: string | null;
  onSelectPage: (id: string) => void;
  onCreatePage: (spaceId: string, parentId: string | null) => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, rightElement }: any) => (
  <div 
    onClick={onClick}
    className={`
      group flex items-center px-3 py-1.5 mx-2 rounded-md cursor-pointer transition-all text-sm font-medium
      ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
    `}
  >
    <Icon size={16} className={`mr-2.5 ${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
    <span className="flex-1 truncate">{label}</span>
    {rightElement}
  </div>
);

interface PageTreeItemProps {
  page: WikiPage;
  depth?: number;
  pages: WikiPage[];
  expandedPages: Set<string>;
  activePageId: string | null;
  onToggleExpand: (e: React.MouseEvent, pageId: string) => void;
  onSelectPage: (id: string) => void;
  onCreatePage: (spaceId: string, parentId: string | null) => void;
}

const PageTreeItem: React.FC<PageTreeItemProps> = ({ 
  page, 
  depth = 0, 
  pages, 
  expandedPages, 
  activePageId, 
  onToggleExpand, 
  onSelectPage, 
  onCreatePage 
}) => {
  const children = pages.filter(p => p.parentId === page.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedPages.has(page.id);
  const isActive = activePageId === page.id;

  return (
    <div className="select-none">
      <div 
        className={`
          group flex items-center pr-3 py-1 my-0.5 rounded-md cursor-pointer transition-colors text-sm
          ${isActive ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
        `}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={() => onSelectPage(page.id)}
      >
        <div 
          className={`mr-1 p-0.5 rounded hover:bg-white/10 ${hasChildren ? 'visible' : 'invisible'}`}
          onClick={(e) => onToggleExpand(e, page.id)}
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </div>
        
        <span className="mr-2 text-base leading-none opacity-80">{page.icon}</span>
        <span className="truncate flex-1 font-medium">{page.title || 'Untitled'}</span>

        {/* Hover Actions */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <button 
              className="p-1 hover:bg-white/20 rounded text-gray-400 hover:text-white"
              onClick={(e) => { e.stopPropagation(); onCreatePage(page.spaceId, page.id); }}
          >
              <Plus size={12} />
          </button>
          <button className="p-1 hover:bg-white/20 rounded text-gray-400 hover:text-white">
              <MoreHorizontal size={12} />
          </button>
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div>
          {children.map(child => (
            <PageTreeItem 
              key={child.id} 
              page={child} 
              depth={depth + 1}
              pages={pages}
              expandedPages={expandedPages}
              activePageId={activePageId}
              onToggleExpand={onToggleExpand}
              onSelectPage={onSelectPage}
              onCreatePage={onCreatePage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  spaces, 
  pages, 
  activePageId, 
  onSelectPage, 
  onCreatePage 
}) => {
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [collapsedSpaces, setCollapsedSpaces] = useState<Set<string>>(new Set());
  const teamMembers = getTeamMembers();

  const togglePageExpand = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    const newSet = new Set(expandedPages);
    if (newSet.has(pageId)) newSet.delete(pageId);
    else newSet.add(pageId);
    setExpandedPages(newSet);
  };

  const toggleSpaceCollapse = (spaceId: string) => {
    const newSet = new Set(collapsedSpaces);
    if (newSet.has(spaceId)) newSet.delete(spaceId);
    else newSet.add(spaceId);
    setCollapsedSpaces(newSet);
  };

  return (
    <div className="w-[260px] flex-shrink-0 bg-[#151720] border-r border-gray-800 h-screen flex flex-col text-gray-300">
      
      {/* 1. Workspace Switcher */}
      <div className="h-14 flex items-center px-4 border-b border-gray-800 hover:bg-white/5 cursor-pointer transition-colors">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center text-white text-xs font-bold mr-3 shadow-lg shadow-blue-500/20">
          N
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-100 truncate">Darevel Wiki</div>
          <div className="text-[10px] text-gray-500 font-medium">Free Plan</div>
        </div>
        <ChevronDown size={14} className="text-gray-500" />
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        
        {/* 2. Main Navigation */}
        <div className="mb-6">
          <SidebarItem icon={Layout} label="Dashboard" />
          <SidebarItem icon={Clock} label="Recent" />
          <SidebarItem icon={Star} label="Favorites" 
            rightElement={<span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">{pages.filter(p => p.isFavorite).length}</span>} 
          />
        </div>

        {/* 3. Spaces & Pages */}
        <div className="mb-2 px-4 flex items-center justify-between group">
             <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Spaces</span>
             <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded text-gray-400 transition-opacity">
                <Plus size={12} />
             </button>
        </div>

        <div className="space-y-4 mb-8">
            {spaces.map(space => {
               const rootPages = pages.filter(p => p.spaceId === space.id && !p.parentId);
               const isCollapsed = collapsedSpaces.has(space.id);
               
               return (
                   <div key={space.id} className="mb-2">
                       <div 
                          className="px-4 py-1 flex items-center group cursor-pointer hover:text-white transition-colors"
                          onClick={() => toggleSpaceCollapse(space.id)}
                        >
                           <div className={`mr-1 p-0.5 rounded hover:bg-white/10 text-gray-500`}>
                             {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                           </div>
                           <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-200 uppercase tracking-wide flex-1 flex items-center gap-2">
                               {space.name}
                           </span>
                           <button 
                             onClick={(e) => { e.stopPropagation(); onCreatePage(space.id, null); }}
                             className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded text-gray-400"
                           >
                               <Plus size={12} />
                           </button>
                       </div>
                       
                       {!isCollapsed && (
                         <div className="mt-1">
                             {rootPages.map(page => (
                                 <PageTreeItem 
                                    key={page.id} 
                                    page={page} 
                                    pages={pages}
                                    expandedPages={expandedPages}
                                    activePageId={activePageId}
                                    onToggleExpand={togglePageExpand}
                                    onSelectPage={onSelectPage}
                                    onCreatePage={onCreatePage}
                                 />
                             ))}
                             {rootPages.length === 0 && (
                                 <div className="px-8 text-xs text-gray-600 italic py-1">Empty space</div>
                             )}
                         </div>
                       )}
                   </div>
               );
            })}
        </div>

        {/* 4. Team Section */}
        <div className="mb-2 px-4 flex items-center justify-between">
             <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Team</span>
        </div>
        <div className="px-2 space-y-1">
            {teamMembers.map(user => (
              <div key={user.id} className="flex items-center px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer group">
                  <div className="relative mr-2">
                    <img src={user.avatar} className="w-5 h-5 rounded-full grayscale group-hover:grayscale-0 transition-all" alt={user.name} />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-[#151720] ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-200 truncate">{user.name}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;