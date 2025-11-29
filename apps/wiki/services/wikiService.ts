import { WikiPage, WikiSpace, User, Block } from '../types';

// Initial Data Seeding
const INITIAL_SPACES: WikiSpace[] = [
  { id: 'space-1', name: 'Engineering', icon: '🛠️', description: 'Technical documentation and specs', type: 'team' },
  { id: 'space-2', name: 'Product', icon: '🚀', description: 'Roadmaps and feature ideas', type: 'team' },
  { id: 'space-3', name: 'General', icon: '🏠', description: 'Company policies and info', type: 'public' },
];

const INITIAL_PAGES: WikiPage[] = [
  {
    id: 'page-1',
    spaceId: 'space-1',
    parentId: null,
    title: 'Engineering Handbook',
    icon: '👋',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isFavorite: true,
    blocks: [
      { id: 'b1', type: 'h1', content: 'Welcome to Engineering' },
      { id: 'b2', type: 'callout', content: '💡 New: Please review the updated deployment process in section 3.' },
      { id: 'b3', type: 'paragraph', content: 'This is the central hub for all engineering related documentation. Please keep it up to date.' },
      { id: 'b4', type: 'h2', content: 'Key Resources' },
      { id: 'b5', type: 'check', content: 'Read the Onboarding Guide', checked: true },
      { id: 'b6', type: 'check', content: 'Setup local environment', checked: false },
      { id: 'b7', type: 'divider', content: '' },
      { id: 'b8', type: 'quote', content: '“Code is like humor. When you have to explain it, it’s bad.” – Cory House' },
    ]
  },
  {
    id: 'page-2',
    spaceId: 'space-1',
    parentId: 'page-1',
    title: 'Setup Guide',
    icon: '💻',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    blocks: [
      { id: 'b1', type: 'paragraph', content: 'Follow these steps to set up your environment.' },
      { id: 'b2', type: 'code', content: 'npm install\nnpm start' },
    ]
  },
  {
    id: 'page-3',
    spaceId: 'space-2',
    parentId: null,
    title: 'Q3 Roadmap',
    icon: '🗺️',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    blocks: [
      { id: 'b1', type: 'h1', content: 'Q3 Goals' },
      { id: 'b2', type: 'paragraph', content: 'Our focus this quarter is on performance and reliability.' },
    ]
  }
];

const CURRENT_USER: User = {
  id: 'u1',
  name: 'Demo User',
  avatar: 'https://i.pravatar.cc/150?u=u1',
  role: 'ADMIN',
  status: 'online'
};

// LocalStorage Keys
const SPACES_KEY = 'nexwiki_spaces';
const PAGES_KEY = 'nexwiki_pages';

export const getSpaces = (): WikiSpace[] => {
  const stored = localStorage.getItem(SPACES_KEY);
  if (!stored) {
    localStorage.setItem(SPACES_KEY, JSON.stringify(INITIAL_SPACES));
    return INITIAL_SPACES;
  }
  return JSON.parse(stored);
};

export const getPages = (): WikiPage[] => {
  const stored = localStorage.getItem(PAGES_KEY);
  if (!stored) {
    localStorage.setItem(PAGES_KEY, JSON.stringify(INITIAL_PAGES));
    return INITIAL_PAGES;
  }
  return JSON.parse(stored);
};

export const savePage = (page: WikiPage): void => {
  const pages = getPages();
  const index = pages.findIndex(p => p.id === page.id);
  if (index >= 0) {
    pages[index] = { ...page, updatedAt: Date.now() };
  } else {
    pages.push(page);
  }
  localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
};

export const createNewPage = (spaceId: string, parentId: string | null = null): WikiPage => {
  const newPage: WikiPage = {
    id: `page-${Date.now()}`,
    spaceId,
    parentId,
    title: 'Untitled',
    icon: '📄',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    blocks: [{ id: `block-${Date.now()}`, type: 'paragraph', content: '' }]
  };
  savePage(newPage);
  return newPage;
};

export const deletePageById = (id: string): void => {
  let pages = getPages();
  const toDelete = new Set<string>([id]);
  let added = true;
  while (added) {
    added = false;
    pages.forEach(p => {
      if (p.parentId && toDelete.has(p.parentId) && !toDelete.has(p.id)) {
        toDelete.add(p.id);
        added = true;
      }
    });
  }
  pages = pages.filter(p => !toDelete.has(p.id));
  localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
};

export const getCurrentUser = (): User => CURRENT_USER;

export const getTeamMembers = (): User[] => [
    CURRENT_USER,
    { id: 'u2', name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=u2', role: 'EDITOR', status: 'online' },
    { id: 'u3', name: 'Mike Ross', avatar: 'https://i.pravatar.cc/150?u=u3', role: 'VIEWER', status: 'busy' },
];