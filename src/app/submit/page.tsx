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
        comments: string;
    }>({
        text: '',
        author: '',
        sourceTitle: '',
        comments: ''
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
                const data = await res.json();
                alert(`Failed to submit quote: ${data.error || 'Unknown error'}`);
            }
        } catch (error: any) {
            console.error(error);
            alert(`An error occurred: ${error.message || 'Unknown error'}`);
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
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Rapper or Author</label>
                    <input
                        required
                        type="text"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent)]"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Song Title (Optional)</label>
                    <input
                        type="text"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent)]"
                        value={formData.sourceTitle}
                        onChange={(e) => setFormData({ ...formData, sourceTitle: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Comments (Optional)</label>
                    <textarea
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent)] h-24"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        placeholder="Any extra context?"
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
