export type SearchCategory = 'all' | 'chat' | 'mail' | 'docs' | 'wiki' | 'files' | 'tasks' | 'calendar' | 'users';

export interface SearchResult {
  id: string;
  type: SearchCategory;
  title: string;
  snippet?: string;
  url: string;
  timestamp: string;
  metadata?: {
    author?: string;
    fileSize?: string;
    status?: 'todo' | 'in-progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    avatar?: string;
    folderPath?: string;
    emailFrom?: string;
  };
}

export interface SearchFilters {
  category: SearchCategory;
  dateRange: 'any' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'relevance' | 'newest';
}

export interface SearchState {
  isPaletteOpen: boolean;
  query: string;
  results: SearchResult[];
  suggestions: string[];
  recentSearches: string[];
  isLoading: boolean;
  filters: SearchFilters;
}
