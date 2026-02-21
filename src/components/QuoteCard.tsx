'use client';

import { useRef, useState } from 'react';
import { Quote } from '@/data/quotes';
import { useSession } from 'next-auth/react';
import { TOPIC_NAMES } from '@/data/topics';
import { Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';

let isHtmlToImagePreloaded = false;

interface QuoteCardProps {
    quote: Quote;
    isFavorited?: boolean;
    onToggleFavorite?: (id: number) => void;
    onTopicClick?: (topicId: string) => void;
    activeTopicIds?: string[];
}

export function QuoteCard({ quote, isFavorited, onToggleFavorite, onTopicClick, activeTopicIds = [] }: QuoteCardProps) {
    const { data: session } = useSession();
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    const handlePointerEnter = () => {
        if (!isHtmlToImagePreloaded && cardRef.current) {
            isHtmlToImagePreloaded = true;
            // Pré-charger le cache de html-to-image en tâche de fond
            toPng(cardRef.current, { width: 10, height: 10 }).catch(() => {
                isHtmlToImagePreloaded = false;
            });
        }
    };

    const fallbackDownload = (dataUrl: string) => {
        const link = document.createElement('a');
        link.download = `rapjedi-quote.png`;
        link.href = dataUrl;
        link.click();
    };

    const handleShare = async () => {
        if (!cardRef.current) return;

        try {
            setIsSharing(true);
            // Laisser le temps à React de masquer les boutons et d'afficher le filigrane
            await new Promise(resolve => setTimeout(resolve, 50));

            const dataUrl = await toPng(cardRef.current, {
                quality: 0.95,
                style: { transform: 'none' } // Évite des soucis d'échelle
            });

            if (navigator.share) {
                try {
                    const response = await fetch(dataUrl);
                    const blob = await response.blob();
                    const file = new File([blob], `rapjedi-quote.png`, { type: 'image/png' });

                    await navigator.share({
                        title: 'Rap Jedi Quote',
                        text: `"${quote.text}" - ${quote.author}`,
                        files: [file]
                    });
                } catch (shareError: any) {
                    if (shareError.name === 'AbortError') {
                        return; // Annulé par l'utilisateur
                    }
                    console.warn("Délai ou erreur avec Web Share API, fallback vers téléchargement:", shareError);
                    fallbackDownload(dataUrl);
                }
            } else {
                fallbackDownload(dataUrl);
            }
        } catch (error) {
            console.error('Erreur lors de la capture d\'image :', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handlePinClick = async () => {
        if (!session) {
            alert("Please sign in to pin quotes.");
            return;
        }

        if (onToggleFavorite) {
            onToggleFavorite(quote.id);
        }
    };

    return (
        <div
            ref={cardRef}
            onPointerEnter={handlePointerEnter}
            onTouchStart={handlePointerEnter}
            className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group h-full flex flex-col justify-between overflow-hidden"
            style={{
                backgroundImage: quote.sourceType
                    ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('/backgrounds/${quote.sourceType.toLowerCase()}.jpg')`
                    : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {isSharing ? (
                <div className="absolute top-4 right-4 z-20 flex items-center space-x-1 text-sm text-white font-mono mix-blend-screen drop-shadow-md">
                    <span>RAP</span>
                    <img
                        src="/android-chrome-192x192.png"
                        alt="Rap Jedi Logo"
                        width="24"
                        height="24"
                        className="object-contain"
                    />
                    <span>JEDI.COM</span>
                </div>
            ) : (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
                    <button
                        onClick={handleShare}
                        className="text-neutral-500 hover:text-white transition-colors duration-300"
                        aria-label="Share quote"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handlePinClick}
                        className="flex items-center gap-2 group/btn"
                        aria-label={isFavorited ? "Unpin quote" : "Pin quote"}
                    >
                        {(quote.favoritesCount || 0) > 0 && (
                            <span className="text-xs text-neutral-500 group-hover/btn:text-neutral-400">
                                {quote.favoritesCount}
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
            )}

            <div className="relative z-10">
                <div className="mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent)] opacity-80">{quote.sourceType}</span>
                </div>

                <blockquote className="text-xl md:text-2xl font-serif text-white leading-relaxed mb-6">
                    "{quote.text}"
                </blockquote>
            </div>

            <div className="flex flex-col gap-4 mt-auto relative z-10">
                <div className="border-t border-neutral-800/50 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <span className="text-white font-semibold block">{quote.author}</span>
                        <span className="text-zinc-500 text-sm italic">{quote.sourceTitle}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {quote.topicIds.map((tid) => {
                            const isActive = activeTopicIds.includes(tid);
                            return (
                                <span
                                    key={tid}
                                    onClick={() => onTopicClick?.(tid)}
                                    className={`px-2 py-1 rounded text-xs border transition-colors cursor-pointer backdrop-blur-sm
                                        ${isActive
                                            ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]'
                                            : 'bg-neutral-800/80 text-zinc-400 border-neutral-700 hover:border-[var(--accent)] hover:text-[var(--accent)]'
                                        }`}
                                >
                                    {TOPIC_NAMES[tid] || tid}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
