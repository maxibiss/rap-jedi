"use client";

import { Quote } from '@/data/quotes';
import { TOPIC_NAMES } from '@/data/topics';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface QuoteOfTheDayProps {
    quote: Quote;
}

export function QuoteOfTheDay({ quote }: QuoteOfTheDayProps) {
    const { data: session } = useSession();
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoritesCount, setFavoritesCount] = useState(quote.favoritesCount || 0);

    useEffect(() => {
        if (session?.user?.email) {
            fetch('/api/user/favorites')
                .then(res => res.json())
                .then(data => {
                    if (data.favorites && data.favorites.includes(quote.id)) {
                        setIsFavorited(true);
                    }
                })
                .catch(err => console.error("Failed to check favorite status", err));
        }
    }, [session, quote.id]);

    const handleToggleFavorite = async () => {
        if (!session) {
            alert("Please sign in to pin quotes.");
            return;
        }

        // Optimistic update
        const newStatus = !isFavorited;
        setIsFavorited(newStatus);
        setFavoritesCount(prev => newStatus ? prev + 1 : prev - 1);

        try {
            const res = await fetch('/api/user/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId: quote.id })
            });

            const data = await res.json();
            if (data.error) {
                alert(data.error);
                // Revert
                setIsFavorited(!newStatus);
                setFavoritesCount(prev => newStatus ? prev - 1 : prev + 1);
            }
        } catch (error) {
            console.error(error);
            // Revert
            setIsFavorited(!newStatus);
            setFavoritesCount(prev => newStatus ? prev - 1 : prev + 1);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-10 bg-gradient-to-r from-neutral-900 to-neutral-800 border-l-4 border-[var(--accent)] rounded-r-xl p-6 shadow-lg flex flex-col md:flex-row items-center md:items-start gap-6 relative group">
            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={handleToggleFavorite}
                    className="flex items-center gap-2 group/btn"
                    aria-label={isFavorited ? "Unpin quote" : "Pin quote"}
                >
                    {(favoritesCount > 0) && (
                        <span className="text-xs text-neutral-500 group-hover/btn:text-neutral-400">
                            {favoritesCount}
                        </span>
                    )}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={isFavorited ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-colors duration-300 ${isFavorited ? 'text-[var(--accent)]' : 'text-neutral-600 hover:text-neutral-400'}`}
                    >
                        <line x1="12" y1="17" x2="12" y2="22"></line>
                        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                    </svg>
                </button>
            </div>

            <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest">Quote of the Day</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                    <span className="text-xs text-zinc-500 font-mono uppercase">{quote.sourceType}</span>
                </div>

                <blockquote className="text-xl md:text-2xl font-serif text-white leading-relaxed mb-4">
                    "{quote.text}"
                </blockquote>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-white font-semibold">{quote.author}</span>
                    {quote.sourceTitle && (
                        <>
                            <span className="hidden sm:inline text-neutral-600">•</span>
                            <span className="text-zinc-500 text-sm italic">{quote.sourceTitle}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2 justify-end self-stretch items-end min-w-[200px] mt-2 md:mt-0">
                <div className="flex-grow"></div>
                <div className="flex flex-wrap gap-2 justify-end">
                    {quote.topicIds.slice(0, 3).map((tid) => (
                        <span
                            key={tid}
                            className="px-2 py-1 rounded text-[10px] bg-neutral-950/50 text-zinc-500 border border-neutral-800"
                        >
                            {TOPIC_NAMES[tid] || tid}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
