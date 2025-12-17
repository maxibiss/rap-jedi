'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SubmitQuotePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState<{
        text: string;
        author: string;
        sourceTitle: string;
        sourceType: string;
        topicIds: string;
    }>({
        text: '',
        author: '',
        sourceTitle: '',
        sourceType: '',
        topicIds: ''
    });
    const [loading, setLoading] = useState(false);

    if (status === 'loading') return null;

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-4">Sign in required</h1>
                    <p className="text-zinc-400 mb-6">You must be logged in to submit a quote.</p>
                    <button onClick={() => router.push('/api/auth/signin')} className="bg-[var(--accent)] text-black font-bold py-2 px-6 rounded-full hover:opacity-90 transition-opacity">
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/quotes/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Quote submitted successfully! Pending approval.');
                router.push('/');
            } else {
                alert('Failed to submit quote.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Submit a Quote</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Quote Text</label>
                    <textarea
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent)] h-32"
                        value={formData.text}
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Author</label>
                    <input
                        required
                        type="text"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent)]"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Source Title (Optional)</label>
                    <input
                        type="text"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent)]"
                        value={formData.sourceTitle}
                        onChange={(e) => setFormData({ ...formData, sourceTitle: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Source Type (Optional, e.g. Book, Movie)</label>
                    <input
                        type="text"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent)]"
                        value={formData.sourceType}
                        onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Topic IDs (comma separated, e.g. "1.1, 2.1")</label>
                    <input
                        required
                        type="text"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent)]"
                        placeholder="1.1, 2.1"
                        value={formData.topicIds}
                        onChange={(e) => setFormData({ ...formData, topicIds: e.target.value })}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--accent)] text-black font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Quote'}
                    </button>
                </div>
            </form>
        </div>
    );
}
