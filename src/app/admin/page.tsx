import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"
import { ActionButtons } from "./ActionButtons"

const prisma = new PrismaClient()

// Server Component
export default async function AdminDashboard() {
    const session = await auth()

    // Secure the page
    if (!session || !session.user || session.user.role !== "ADMIN") {
        redirect('/')
    }

    const pendingQuotes = await prisma.quote.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: 'desc' },
        include: { suggestedBy: true }
    })

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-full text-zinc-400 text-sm">
                    Logged in as Admin
                </div>
            </div>

            <div className="grid gap-6">
                <h2 className="text-xl font-semibold text-white/80">Pending Approvals ({pendingQuotes.length})</h2>

                {pendingQuotes.length === 0 && (
                    <p className="text-zinc-500 italic">No pending quotes.</p>
                )}

                {pendingQuotes.map((quote) => (
                    <div key={quote.id} className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl flex flex-col md:flex-row gap-6 justify-between items-start">
                        <div>
                            <p className="text-lg text-white mb-2">"{quote.text}"</p>
                            <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                                <span>Author: <span className="text-zinc-300">{quote.author}</span></span>
                                <span>Source: {quote.sourceTitle || '-'}</span>
                                <span>Topics: {quote.topicIds}</span>
                                <span>By: {quote.suggestedBy?.email || 'Unknown'}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            {/* We need client interactivity for buttons. 
                                Since this is a server component, we can use a small Client Component for the actions 
                                or make the whole page client. Better: Client Component for the row actions. 
                            */}
                            <ActionButtons quoteId={quote.id} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
