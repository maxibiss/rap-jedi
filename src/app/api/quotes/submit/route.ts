import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await auth()

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const data = await req.json()
        const userEmail = session.user.email

        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        })

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        const newQuote = await prisma.quote.create({
            data: {
                text: data.text,
                author: data.author,
                sourceTitle: data.sourceTitle || null,
                sourceType: data.sourceType || null,
                topicIds: data.topicIds,
                status: "PENDING",
                suggestedByUserId: user.id
            }
        })

        return NextResponse.json({ success: true, quote: newQuote })

    } catch (error: any) {
        console.error("Error submitting quote:", error)
        // Return the actual error message for debugging
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}
