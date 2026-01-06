import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function PUT(req: Request) {
    const session = await auth()

    // Admin Check
    if (!session || !session.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    try {
        const { quoteId, action, data } = await req.json()

        if (!quoteId || !action) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        if (action === "UPDATE") {
            if (!data) return NextResponse.json({ error: "Missing data" }, { status: 400 })
            await prisma.quote.update({
                where: { id: quoteId },
                data: {
                    text: data.text,
                    author: data.author,
                    sourceTitle: data.sourceTitle,
                    sourceType: data.sourceType,
                    topicIds: data.topicIds,
                    comments: data.comments
                }
            })
        } else if (action === "APPROVE") {
            await prisma.quote.update({
                where: { id: quoteId },
                data: { status: "PUBLISHED" }
            })
        } else if (action === "REJECT") {
            await prisma.quote.update({
                where: { id: quoteId },
                data: { status: "REJECTED" }
            })
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error updating quote:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
