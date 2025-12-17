"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
    const router = useRouter()
    const [data, setData] = useState({ name: "", email: "", password: "" })
    const [error, setError] = useState("")

    const register = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                // Redirect to login or home
                // For Credentials provider, we usually redirect to signin page to let them log in
                // Or try to sign them in automatically (harder with Credentials provider client side securely without duplicate creds)
                router.push("/api/auth/signin")
            } else {
                const text = await res.text()
                setError(text)
            }
        } catch (err) {
            setError("Something went wrong")
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="max-w-md w-full bg-neutral-900 p-8 rounded-lg shadow-lg border border-neutral-800">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign Up</h2>
                {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}

                <form onSubmit={register} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-[var(--accent)]"
                            value={data.name}
                            onChange={e => setData({ ...data, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-[var(--accent)]"
                            value={data.email}
                            onChange={e => setData({ ...data, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-black border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-[var(--accent)]"
                            value={data.password}
                            onChange={e => setData({ ...data, password: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[var(--accent)] text-black font-bold py-2 rounded hover:opacity-90 transition"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    )
}
