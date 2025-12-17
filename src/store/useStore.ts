import { create } from 'zustand';
import { Quote, QUOTES } from '@/data/quotes';

interface StoreState {
    quotes: Quote[];
    activeTopicIds: string[];
    filteredQuotes: Quote[];
    sortBy: 'newest' | 'popular';
    setSortBy: (sort: 'newest' | 'popular') => void;
    pickRandom: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    toggleTopic: (topicId: string) => void;
    resetTopics: () => void;
    activeSourceTypes: string[];
    toggleSourceType: (sourceType: string) => void;
}

const sortQuotes = (quotes: Quote[], sortBy: 'newest' | 'popular') => {
    const sorted = [...quotes];
    if (sortBy === 'popular') {
        sorted.sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0));
    } else {
        sorted.sort((a, b) => b.id - a.id);
    }
    return sorted;
};

// Helper to filter by topics, search query, AND source type
const filterQuotes = (quotes: Quote[], activeTopicIds: string[], searchQuery: string, activeSourceTypes: string[]) => {
    let filtered = quotes;

    // 1. Filter by Topics
    if (activeTopicIds.length > 0) {
        filtered = filtered.filter(quote =>
            activeTopicIds.every(activeId => quote.topicIds.includes(activeId))
        );
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(quote =>
            quote.text.toLowerCase().includes(lowerQuery) ||
            quote.author.toLowerCase().includes(lowerQuery) ||
            quote.sourceTitle.toLowerCase().includes(lowerQuery)
        );
    }

    // 3. Filter by Source Type
    if (activeSourceTypes && activeSourceTypes.length > 0) {
        filtered = filtered.filter(quote =>
            activeSourceTypes.includes(quote.sourceType)
        );
    }

    return filtered;
};

export const useStore = create<StoreState>((set) => ({
    quotes: QUOTES,
    activeTopicIds: [],
    filteredQuotes: QUOTES,
    sortBy: 'newest',
    searchQuery: '',
    activeSourceTypes: [],

    setSearchQuery: (query) => set((state) => {
        const filtered = filterQuotes(state.quotes, state.activeTopicIds, query, state.activeSourceTypes);
        const sorted = sortQuotes(filtered, state.sortBy);
        return { searchQuery: query, filteredQuotes: sorted };
    }),

    setSortBy: (sortBy) => set((state) => {
        const baseQuotes = filterQuotes(state.quotes, state.activeTopicIds, state.searchQuery, state.activeSourceTypes);
        const sorted = sortQuotes(baseQuotes, sortBy);
        return { sortBy, filteredQuotes: sorted };
    }),

    pickRandom: () => set((state) => {
        const randomQuote = state.quotes[Math.floor(Math.random() * state.quotes.length)];
        return {
            activeTopicIds: [],
            searchQuery: '',
            activeSourceTypes: [], // Reset source filters too
            filteredQuotes: [randomQuote],
            sortBy: 'newest'
        };
    }),

    toggleTopic: (topicId: string) => set((state) => {
        const isActive = state.activeTopicIds.includes(topicId);
        const newActiveTopicIds = isActive
            ? state.activeTopicIds.filter(id => id !== topicId)
            : [...state.activeTopicIds, topicId];

        let newFilteredQuotes = filterQuotes(state.quotes, newActiveTopicIds, state.searchQuery, state.activeSourceTypes);
        newFilteredQuotes = sortQuotes(newFilteredQuotes, state.sortBy);

        return {
            activeTopicIds: newActiveTopicIds,
            filteredQuotes: newFilteredQuotes
        };
    }),

    toggleSourceType: (sourceType: string) => set((state) => {
        const isActive = state.activeSourceTypes.includes(sourceType);
        const newSourceTypes = isActive
            ? state.activeSourceTypes.filter(t => t !== sourceType)
            : [...state.activeSourceTypes, sourceType];

        let newFilteredQuotes = filterQuotes(state.quotes, state.activeTopicIds, state.searchQuery, newSourceTypes);
        newFilteredQuotes = sortQuotes(newFilteredQuotes, state.sortBy);

        return {
            activeSourceTypes: newSourceTypes,
            filteredQuotes: newFilteredQuotes
        };
    }),

    resetTopics: () => set((state) => ({
        activeTopicIds: [],
        searchQuery: '',
        activeSourceTypes: [],
        filteredQuotes: state.quotes,
        sortBy: 'newest'
    }))
}));
