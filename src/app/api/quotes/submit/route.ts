import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(req: Request) {
    const session = await auth()

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const data = await req.json()
        const userEmail = session.user.email

        // Find user ID (assumes user exists in DB, which seed/login flow should ensure if persistence is on, 
        // but with next-auth 'database' strategy, user is created on login. 
        // If we mocked login without DB, user might not exist in Prisma User table?)
        // With `adapter: PrismaAdapter`, user IS created on login if not exists.

        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        })

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        await prisma.quote.create({
            data: {
                text: data.text,
                author: data.author,
                sourceTitle: data.sourceTitle || null,
                sourceType: data.sourceType || null,
                topicIds: data.topicIds, // Validate format?
                status: "PENDING",
                suggestedByUserId: user.id
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error submitting quote:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
