
import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json()

        if (!email || !password) {
            return new NextResponse("Missing email or password", { status: 400 })
        }

        const exists = await prisma.user.findUnique({
            where: { email }
        })

        if (exists) {
            return new NextResponse("User already exists", { status: 400 })
        }

        const nameExists = await prisma.user.findFirst({
            where: { name }
        })

        if (nameExists) {
            return new NextResponse("Username already taken", { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const role = (email === process.env.ADMIN_EMAIL) ? "ADMIN" : "USER"

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role
            }
        })

        return NextResponse.json(user)

    } catch (error) {
        console.log("REGISTER_ERROR", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
