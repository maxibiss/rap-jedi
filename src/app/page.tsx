import { MindMapViz } from '@/components/MindMapViz';
import { ClientOnly } from '@/components/ClientOnly';
import { QuoteList } from '@/components/QuoteList';
import { PrismaClient } from '@prisma/client';
import { HydrateQuotes } from '@/components/HydrateQuotes';
import { AuthButton } from '@/components/AuthButton';

import { QuoteOfTheDay } from '@/components/QuoteOfTheDay';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'; // Ensure we fetch fresh data

export default async function Home() {
  const quotes = await prisma.quote.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      _count: {
        select: { favoritedBy: true }
      }
    }
  });

  // Map Prisma result to our Quote interface
  const mappedQuotes = quotes.map((q) => ({
    id: q.id,
    text: q.text,
    author: q.author,
    sourceType: q.sourceType || "Unknown",
    sourceTitle: q.sourceTitle || "",
    isPinned: false, // Initial client state, hydration will handle user specifics if needed, but we rely on QuoteList for user state
    topicIds: q.topicIds ? q.topicIds.split(',').map(s => s.trim()).filter(Boolean) : [],
    favoritesCount: q._count.favoritedBy
  }));

  // Deterministic Quote of the Day Logic
  // Use UTC date string (YYYY-MM-DD) as seed
  const today = new Date().toISOString().split('T')[0];

  // Simple string hash function
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // Ensure positive index
  const qotdIndex = Math.abs(hash) % mappedQuotes.length;
  const quoteOfTheDay = mappedQuotes[qotdIndex];

  return (
    <main className="min-h-screen p-6 md:p-12 lg:p-24 max-w-7xl mx-auto flex flex-col items-center relative">
      <div className="absolute top-6 right-6 z-50">
        <AuthButton />
      </div>
      <HydrateQuotes quotes={mappedQuotes} />

      <header className="mb-8 md:mb-12 text-center w-full">
        {/* Hero Section with Background */}
        <div className="relative w-full rounded-3xl overflow-hidden border border-neutral-800 mb-8 shadow-2xl">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: 'url("/backgrounds/rap jedi.jpg")' }}
          ></div>

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-neutral-900/90"></div>

          {/* Content */}
          <div className="relative z-10 py-24 md:py-32 px-4 flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-12 drop-shadow-2xl">
              <span className="text-white tracking-widest uppercase font-mono">RAP JEDI</span>
            </h1>

            <div className="space-y-4 backdrop-blur-sm bg-black/30 p-6 rounded-2xl border border-white/10">
              <p className="text-xl md:text-2xl text-[var(--accent)] font-light">
                The <span className="font-bold drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">Force</span> is in the Flow.
              </p>

              <p className="text-zinc-300 text-lg max-w-2xl mx-auto font-medium">
                A Collection of Rap Quotes for Finding the Way.
              </p>
            </div>
          </div>
        </div>

        {quoteOfTheDay && <QuoteOfTheDay quote={quoteOfTheDay} />}

        <div className="w-full mt-8">
          <ClientOnly>
            <MindMapViz />
          </ClientOnly>
        </div>
      </header>

      <div className="w-full">
        <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-2">
          <h3 className="text-xl text-white font-semibold">The Holocron</h3>
          <a href="/submit" className="bg-[var(--accent)] text-black font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm">
            Send a quote
          </a>
        </div>
        <QuoteList />
      </div>

      <footer className="w-full mt-24 py-8 border-t border-neutral-900 text-center">
        <p className="text-zinc-600 text-sm">
          &copy; {new Date().getFullYear()} Rap Jedi. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
