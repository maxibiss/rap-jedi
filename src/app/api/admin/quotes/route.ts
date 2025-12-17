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
        const { quoteId, action } = await req.json()

        if (!quoteId || !action) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        if (action === "APPROVE") {
            await prisma.quote.update({
                where: { id: quoteId },
                data: { status: "PUBLISHED" }
            })
        } else if (action === "REJECT") {
            await prisma.quote.update({
                where: { id: quoteId },
                data: { status: "REJECTED" }
            })
            // Or delete? Task says "deletes the quote or changes status to REJECTED"
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error updating quote:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
