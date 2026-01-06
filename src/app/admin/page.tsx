import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"
import { AdminQuoteCard } from "./AdminQuoteCard"

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
                    <AdminQuoteCard key={quote.id} quote={quote} />
                ))}
            </div>
        </div>
    )
}
