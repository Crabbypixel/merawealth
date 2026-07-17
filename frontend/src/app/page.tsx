"use client";

import Link from "next/link"

// This is the main page of the application.
// It serves as a landing page -> To be developed further
// Minimal for now
export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-6">
            <h1 className="text-5xl font-bold">
                Fullstack App
            </h1>

            <Link
                href="/login"
                className="text-blue-600 hover:underline"
            >
                Go to login
            </Link>
        </main>
    );
}
