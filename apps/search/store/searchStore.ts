import { create } from 'zustand';
import { SearchResult, SearchFilters } from '../types';
import { searchService } from '../services/searchService';

interface SearchStore {
  isPaletteOpen: boolean;
  query: string;
  results: SearchResult[];
  suggestions: string[];
  recentSearches: string[];
  isLoading: boolean;
  filters: SearchFilters;

  setPaletteOpen: (isOpen: boolean) => void;
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  runSearch: (query: string) => Promise<void>;
  runSuggest: (query: string) => Promise<void>;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  isPaletteOpen: false,
  query: '',
  results: [],
  suggestions: [],
  recentSearches: ['Q3 Reports', 'Onboarding', 'Project Alpha'],
  isLoading: false,
  filters: {
    category: 'all',
    dateRange: 'any',
    sortBy: 'relevance',
  },

  setPaletteOpen: (isOpen) => set({ isPaletteOpen: isOpen }),

  setQuery: (query) => set({ query }),

  setFilters: (newFilters) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    set({ filters: updatedFilters });
    const query = get().query;
    if (query) {
      get().runSearch(query);
    }
  },

  runSearch: async (query) => {
    if (!query.trim()) {
      set({ results: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const { category } = get().filters;
      const results = await searchService.searchGlobal(query, category);
      set({ results, isLoading: false });
    } catch (error) {
      console.error('Search failed', error);
      set({ results: [], isLoading: false });
    }
  },

  runSuggest: async (query) => {
    if (!query.trim()) {
      set({ suggestions: [] });
      return;
    }
    try {
      const suggestions = await searchService.getSuggestions(query);
      set({ suggestions });
    } catch (error) {
      console.error(error);
    }
  },

  addRecentSearch: (term) =>
    set((state) => {
      const newHistory = [term, ...state.recentSearches.filter((s) => s !== term)].slice(0, 5);
      return { recentSearches: newHistory };
    }),

  clearRecentSearches: () => set({ recentSearches: [] }),
}));
