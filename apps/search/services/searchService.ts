import { SearchResult, SearchCategory } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const MOCK_RESULTS: SearchResult[] = [
  {
    id: generateId(),
    type: 'docs',
    title: 'Q3 Financial Overview 2024',
    snippet: 'Analysis of quarterly revenue streams and projection for Q4...',
    url: '/docs/financials-q3',
    timestamp: new Date().toISOString(),
    metadata: { author: 'Alice Finance', folderPath: '/Finance/Reports' },
  },
  {
    id: generateId(),
    type: 'chat',
    title: 'Project Alpha Discussion',
    snippet: 'Hey team, just wanted to check on the latest deployment status.',
    url: '/chat/general/123',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    metadata: { author: 'Bob Engineer', avatar: 'https://picsum.photos/32/32?random=1' },
  },
  {
    id: generateId(),
    type: 'users',
    title: 'Sarah Designer',
    snippet: 'Senior UI/UX Designer • Design Team',
    url: '/users/sarah',
    timestamp: new Date().toISOString(),
    metadata: { avatar: 'https://picsum.photos/32/32?random=2', emailFrom: 'sarah@darevel.com' },
  },
  {
    id: generateId(),
    type: 'tasks',
    title: 'Update Landing Page Hero',
    snippet: 'Replace the static image with the new WebGL canvas component.',
    url: '/tasks/WEB-102',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    metadata: { status: 'in-progress', priority: 'high' },
  },
  {
    id: generateId(),
    type: 'files',
    title: 'logo-brand-kit.fig',
    snippet: 'Figma design file v2.4',
    url: '/files/design/logo',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    metadata: { fileSize: '45 MB', folderPath: '/Design/Assets' },
  },
  {
    id: generateId(),
    type: 'mail',
    title: 'Re: Client Meeting Notes',
    snippet: 'Thanks for sending these over. I have a few questions regarding scope...',
    url: '/mail/inbox/999',
    timestamp: new Date(Date.now() - 10000000).toISOString(),
    metadata: { emailFrom: 'client@partner.com' },
  },
  {
    id: generateId(),
    type: 'wiki',
    title: 'Onboarding Guide: Engineering',
    snippet: 'Setup your environment, git credentials, and access keys.',
    url: '/wiki/eng/onboarding',
    timestamp: new Date(Date.now() - 500000000).toISOString(),
    metadata: { author: 'Wiki Bot' },
  },
  {
    id: generateId(),
    type: 'calendar',
    title: 'Weekly Sync: Product',
    snippet: 'Zoom link: https://zoom.us/j/...',
    url: '/calendar/event/555',
    timestamp: new Date(Date.now() + 86400000).toISOString(),
    metadata: { priority: 'medium' },
  },
];

export const searchService = {
  async searchGlobal(query: string, category: SearchCategory = 'all'): Promise<SearchResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!query) return [];

    const lowerQuery = query.toLowerCase();

    let results = MOCK_RESULTS.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) || item.snippet?.toLowerCase().includes(lowerQuery)
    );

    if (category !== 'all') {
      results = results.filter((item) => item.type === category);
    }

    if (results.length > 0 && results.length < 5) {
      return [...results, ...results, ...results].map((r) => ({ ...r, id: generateId() }));
    }

    return results;
  },

  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];
    await new Promise((resolve) => setTimeout(resolve, 200));

    const base = ['report', 'project alpha', 'deployment', 'onboarding', 'meeting', 'budget'];
    return base.filter((s) => s.includes(query.toLowerCase()));
  },
};
