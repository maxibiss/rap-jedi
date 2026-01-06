'use client';

import { useStore } from '@/store/useStore';
import { QuoteCard } from './QuoteCard';
import { BoomboxSwitch } from './BoomboxSwitch';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function QuoteList() {
    const filteredQuotes = useStore((state) => state.filteredQuotes);
    const activeTopicIds = useStore((state) => state.activeTopicIds);
    const toggleTopic = useStore((state) => state.toggleTopic);

    // Move these up
    const searchQuery = useStore((state) => state.searchQuery);
    const setSearchQuery = useStore((state) => state.setSearchQuery);
    const activeSourceTypes = useStore((state) => state.activeSourceTypes);
    const toggleSourceType = useStore((state) => state.toggleSourceType);
    const allQuotes = useStore((state) => state.quotes);
    const sortBy = useStore((state) => state.sortBy);
    const setSortBy = useStore((state) => state.setSortBy);
    const pickRandom = useStore((state) => state.pickRandom);

    const { data: session } = useSession();
    const [favorites, setFavorites] = useState<number[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [isRapOnly, setIsRapOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(36);
    const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);

    useEffect(() => {
        if (session?.user?.email) {
            fetch('/api/user/favorites')
                .then(res => res.json())
                .then(data => {
                    if (data.favorites) {
                        setFavorites(data.favorites);
                    }
                })
                .catch(err => console.error("Failed to fetch favorites", err));
        } else {
            setFavorites([]);
        }
    }, [session]);

    const handleToggleFavorite = async (id: number) => {
        // Optimistic update
        const isFav = favorites.includes(id);
        const newFavorites = isFav ? favorites.filter(fid => fid !== id) : [...favorites, id];

        // Enforce limit optimistically?
        if (!isFav && favorites.length >= 5) {
            alert("Limit reached. You can only pin 5 quotes.");
            return;
        }

        setFavorites(newFavorites);

        try {
            const res = await fetch('/api/user/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId: id })
            });
            const data = await res.json();
            if (data.error) {
                // Revert if error
                alert(data.error);
                setFavorites(favorites); // Revert to old state
            }
        } catch (error) {
            console.error(error);
            setFavorites(favorites);
        }
    };

    let quotesToDisplay = filteredQuotes;

    if (isRapOnly) {
        quotesToDisplay = quotesToDisplay.filter(q => q.sourceType === "Rap Song");
    }

    if (showFavoritesOnly) {
        quotesToDisplay = quotesToDisplay.filter(q => favorites.includes(q.id));
    }


    // Pagination Logic
    const totalPages = Math.ceil(quotesToDisplay.length / itemsPerPage);
    const paginatedQuotes = quotesToDisplay.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredQuotes, showFavoritesOnly, isRapOnly, searchQuery, activeSourceTypes]);

    if (filteredQuotes.length === 0) {
        return (
            <div className="text-center py-20 text-neutral-500">
                <p className="text-xl">No quotes found combining these topics.</p>
                <button
                    onClick={() => useStore.getState().resetTopics()}
                    className="mt-4 text-[var(--accent)] hover:underline"
                >
                    Reset Filters
                </button>
            </div>
        );
    }

    // Derive unique source types
    const sourceTypes = Array.from(new Set(allQuotes.map(q => q.sourceType))).filter(Boolean);


    return (
        <div className="w-full">
            {/* Search Bar & Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-neutral-900/50 border border-neutral-800 text-white text-sm rounded-full focus:ring-[var(--accent)] focus:border-[var(--accent)] block pl-10 p-2.5 placeholder-zinc-500 transition-all"
                    />
                </div>



                {/* Source Type Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${activeSourceTypes.length > 0 ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'bg-neutral-900/50 border-neutral-800 text-zinc-400 hover:border-zinc-600'}`}
                    >
                        <span>Filter by Type {activeSourceTypes.length > 0 && `(${activeSourceTypes.length})`}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isSourceDropdownOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>

                    {isSourceDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setIsSourceDropdownOpen(false)}></div>
                            <div className="absolute top-full left-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-30 p-2 overflow-hidden">
                                <div className="max-h-60 overflow-y-auto space-y-1">
                                    {sourceTypes.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => toggleSourceType(type)}
                                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-800 rounded-lg transition-colors text-left"
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeSourceTypes.includes(type) ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-neutral-600'}`}>
                                                {activeSourceTypes.includes(type) && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                )}
                                            </div>
                                            <span className={`text-sm ${activeSourceTypes.includes(type) ? 'text-white' : 'text-zinc-400'}`}>{type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div className="flex flex-wrap gap-2 bg-neutral-900/50 p-1 rounded-full border border-neutral-800 self-end md:self-center">
                    <button
                        onClick={() => setSortBy('newest')}
                        className={`px-4 py-1.5 rounded-full text-sm transition-all ${sortBy === 'newest' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        Newest
                    </button>
                    <button
                        onClick={() => setSortBy('popular')}
                        className={`px-4 py-1.5 rounded-full text-sm transition-all ${sortBy === 'popular' ? 'bg-neutral-800 text-[var(--accent)] shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        Popular
                    </button>
                    <div className="w-px bg-neutral-800 mx-1"></div>
                    <button
                        onClick={() => pickRandom()}
                        className="px-4 py-1.5 rounded-full text-sm text-neutral-500 hover:text-[var(--accent)] transition-all flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        Random
                    </button>
                </div>

                <div className="flex flex-col items-end gap-6">
                    <BoomboxSwitch isRapOnly={isRapOnly} onToggle={setIsRapOnly} />

                    {session && (
                        <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className={`text-sm px-4 py-2 rounded-full border transition-colors ${showFavoritesOnly ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                        >
                            {showFavoritesOnly ? 'Show All' : `My Favorites (${favorites.length}/5)`}
                        </button>
                    )}
                </div>
            </div>

            {/* Pagination Controls - Top (Optional, but good for UX) */}
            <div className="flex justify-between items-center mb-4 text-xs text-zinc-500">
                <div>
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, quotesToDisplay.length)} - {Math.min(currentPage * itemsPerPage, quotesToDisplay.length)} of {quotesToDisplay.length} quotes
                </div>

                <div className="flex items-center gap-2">
                    <span className="mr-2">Per Page:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-zinc-300 focus:ring-[var(--accent)] focus:border-[var(--accent)] outline-none"
                    >
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={36}>36</option>
                        <option value={48}>48</option>
                        <option value={60}>60</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-h-[500px] content-start">
                {paginatedQuotes.map((quote) => (
                    <QuoteCard
                        key={quote.id}
                        quote={quote}
                        isFavorited={favorites.includes(quote.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onTopicClick={toggleTopic}
                        activeTopicIds={activeTopicIds}
                    />
                ))}
            </div>

            {/* Pagination Controls - Bottom */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-full border border-neutral-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            // Simple logic to show first few pages, better logic would be complex sliding window
                            // For now, let's keep it simple or usage "Page X of Y"
                            return null;
                        })}
                        <span className="text-sm text-zinc-500">
                            Page <span className="text-white font-mono">{currentPage}</span> of <span className="text-zinc-500 font-mono">{totalPages}</span>
                        </span>
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-full border border-neutral-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
