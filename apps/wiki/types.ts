export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  status?: 'online' | 'offline' | 'busy';
}

export interface Block {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet' | 'code' | 'callout' | 'quote' | 'divider' | 'check';
  content: string;
  checked?: boolean; // For checklist items
}

export interface WikiPage {
  id: string;
  spaceId: string;
  parentId: string | null;
  title: string;
  icon: string;
  coverImage?: string;
  isFavorite?: boolean;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
  expanded?: boolean; // For tree view state
}

export interface WikiSpace {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'public' | 'private' | 'team';
}

export interface WikiContextType {
  spaces: WikiSpace[];
  pages: WikiPage[];
  activePageId: string | null;
  setActivePageId: (id: string | null) => void;
  createPage: (spaceId: string, parentId?: string | null) => string;
  updatePage: (id: string, updates: Partial<WikiPage>) => void;
  deletePage: (id: string) => void;
  movePage: (id: string, newParentId: string | null) => void;
  currentUser: User;
}