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
        const { quoteId } = await req.json()
        const userEmail = session.user.email

        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: { favorites: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const isFavorited = user.favorites.some((q: any) => q.id === quoteId)

        if (isFavorited) {
            await prisma.user.update({
                where: { email: userEmail },
                data: {
                    favorites: {
                        disconnect: { id: quoteId }
                    }
                }
            })
            return NextResponse.json({ favorited: false })
        } else {
            if (user.favorites.length >= 5) {
                return NextResponse.json({ error: "Limit reached. You can only pin 5 quotes." }, { status: 400 })
            }

            await prisma.user.update({
                where: { email: userEmail },
                data: {
                    favorites: {
                        connect: { id: quoteId }
                    }
                }
            })
            return NextResponse.json({ favorited: true })
        }

    } catch (error) {
        console.error("Error toggling favorite:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const session = await auth()

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { favorites: true }
        })

        if (!user) return NextResponse.json({ favorites: [] })

        return NextResponse.json({ favorites: user.favorites.map((q: any) => q.id) })

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
