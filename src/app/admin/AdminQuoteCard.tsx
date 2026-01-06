'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Quote {
    id: number
    text: string
    author: string
    sourceTitle: string | null
    sourceType: string | null
    topicIds: string | null
    comments: string | null
    suggestedBy: { email: string | null } | null
}

export function AdminQuoteCard({ quote }: { quote: Quote }) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        text: quote.text,
        author: quote.author,
        sourceTitle: quote.sourceTitle || '',
        sourceType: quote.sourceType || '',
        topicIds: quote.topicIds || '',
        comments: quote.comments || ''
    })

    const handleAction = async (action: "APPROVE" | "REJECT" | "UPDATE") => {
        setLoading(true)
        try {
            const payload = action === "UPDATE" ? { quoteId: quote.id, action, data: formData } : { quoteId: quote.id, action }

            const res = await fetch('/api/admin/quotes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                if (action === "UPDATE") {
                    setIsEditing(false)
                    router.refresh()
                } else {
                    router.refresh()
                }
            } else {
                alert("Action failed")
            }
        } catch (e) {
            console.error(e)
            alert("Error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl flex flex-col gap-4">
                <textarea
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white h-24"
                    value={formData.text}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        className="bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                        placeholder="Author"
                        value={formData.author}
                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                    />
                    <input
                        className="bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                        placeholder="Song Title"
                        value={formData.sourceTitle}
                        onChange={e => setFormData({ ...formData, sourceTitle: e.target.value })}
                    />
                    {/* Kept Source Type and Topic IDs if admin wants to edit them, though user asked to remove them from submit form, they are in the DB and part of admin view requirement */}
                    <input
                        className="bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                        placeholder="Source Type (Optional)"
                        value={formData.sourceType}
                        onChange={e => setFormData({ ...formData, sourceType: e.target.value })}
                    />
                    <input
                        className="bg-neutral-950 border border-neutral-800 rounded p-2 text-white"
                        placeholder="Topic IDs"
                        value={formData.topicIds}
                        onChange={e => setFormData({ ...formData, topicIds: e.target.value })}
                    />
                </div>
                <textarea
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white h-20"
                    placeholder="Comments"
                    value={formData.comments}
                    onChange={e => setFormData({ ...formData, comments: e.target.value })}
                />

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="text-zinc-400 hover:text-white px-4 py-2"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleAction("UPDATE")}
                        disabled={loading}
                        className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-4 py-2 rounded-lg hover:bg-blue-600/30"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="w-full">
                <p className="text-lg text-white mb-2">"{quote.text}"</p>
                <div className="flex flex-wrap gap-4 text-sm text-zinc-500 mb-2">
                    <span>Author: <span className="text-zinc-300">{quote.author}</span></span>
                    <span>Source: {quote.sourceTitle || '-'}</span>
                    <span>Type: {quote.sourceType || '-'}</span>
                    <span>Topics: {quote.topicIds || '-'}</span>
                    <span>By: {quote.suggestedBy?.email || 'Unknown'}</span>
                </div>
                {quote.comments && (
                    <div className="bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/50">
                        <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold block mb-1">Comments</span>
                        <p className="text-zinc-300 text-sm">{quote.comments}</p>
                    </div>
                )}
            </div>

            <div className="flex gap-2 shrink-0">
                <button
                    onClick={() => setIsEditing(true)}
                    className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-700"
                >
                    Edit
                </button>
                <button
                    onClick={() => handleAction("APPROVE")}
                    disabled={loading}
                    className="bg-green-600/20 text-green-400 border border-green-600/30 px-4 py-2 rounded-lg hover:bg-green-600/30 disabled:opacity-50"
                >
                    Approve
                </button>
                <button
                    onClick={() => handleAction("REJECT")}
                    disabled={loading}
                    className="bg-red-600/20 text-red-400 border border-red-600/30 px-4 py-2 rounded-lg hover:bg-red-600/30 disabled:opacity-50"
                >
                    Reject
                </button>
            </div>
        </div>
    )
}
