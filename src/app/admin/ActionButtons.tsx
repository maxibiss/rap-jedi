'use client';

import { useRouter } from "next/navigation"
import { useState } from "react"

export function ActionButtons({ quoteId }: { quoteId: number }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleAction = async (action: "APPROVE" | "REJECT") => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/quotes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quoteId, action })
            })
            if (res.ok) {
                router.refresh() // Reload server data
            } else {
                alert("Action failed")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
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
        </>
    )
}
