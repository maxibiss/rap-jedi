'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function AuthButton() {
    const { data: session } = useSession();

    if (session && session.user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-zinc-400 text-sm hidden md:inline flex items-center gap-2">
                    Hello, <span className="text-white">{session.user.name || session.user.email}</span>
                    {session.user.role === 'ADMIN' && (
                        <span className="ml-2 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-500/30 uppercase tracking-wider">
                            Admin
                        </span>
                    )}
                </span>

                {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-xs bg-neutral-800 border border-neutral-700 text-zinc-300 px-3 py-1.5 rounded hover:bg-neutral-700 transition">
                        Dashboard
                    </Link>
                )}

                <button
                    onClick={() => signOut()}
                    className="text-xs bg-[var(--accent)] text-black font-semibold px-3 py-1.5 rounded hover:opacity-90 transition"
                >
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <Link
                href="/register"
                className="text-xs border border-zinc-600 text-zinc-300 px-4 py-1.5 rounded hover:bg-zinc-800 transition duration-300"
            >
                Sign Up
            </Link>
            <button
                onClick={() => signIn()}
                className="text-xs border border-[var(--accent)] text-[var(--accent)] px-4 py-1.5 rounded hover:bg-[var(--accent)] hover:text-black transition duration-300"
            >
                Sign In
            </button>
        </div>
    );
}
