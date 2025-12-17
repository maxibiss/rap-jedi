import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }
                const email = credentials.email as string
                const password = credentials.password as string

                const user = await prisma.user.findUnique({ where: { email } })

                if (!user || !user.password) {
                    // Fallback for mock users/dev or invalid credentials
                    return null
                }

                // Verify password
                const passwordMatch = await bcrypt.compare(password, user.password)

                if (!passwordMatch) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        })
    ],
    callbacks: {
        async session({ session, user, token }) {
            if (session.user) {
                // Add ID and Role to session
                // Note: With adapter strategy 'database', 'user' arg is populated.
                // With 'jwt' strategy (default for credentials), 'token' Is populated.
                // We need to mix them.

                if (token) {
                    session.user.id = token.sub as string;
                    // If we have role in token, use it. To get role in token, we need 'jwt' callback.
                }

                // Simple Admin Check logic for now if not persistent
                if (session.user.email === process.env.ADMIN_EMAIL) {
                    // Force role to admin if matches env var
                    (session.user as any).role = "ADMIN";
                } else {
                    (session.user as any).role = "USER";
                }
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        }
    },
    session: {
        strategy: "jwt" // Required for Credentials provider together with Adapter often
    }
})
