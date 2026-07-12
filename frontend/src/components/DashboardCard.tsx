"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
    name: string;
    email: string;
    phoneNumber: string;
}

export default function DashboardCard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const router = useRouter();

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
                    {
                        credentials: "include",
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    router.push("/session-ended?reason=expired");
                }
            } catch {
                setError("Unable to connect to the server.");
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [router]);

    async function handleLogout() {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
            {
                method: "POST",
                credentials: "include",
            }
        );

        if (response.ok) {
            router.push("/session-ended?reason=logout");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
                <p className="text-lg font-medium text-gray-600">
                    Loading...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Top Navigation Bar */}
            <header className="flex items-center justify-end bg-white shadow px-8 py-4">

                <div className="flex items-center gap-6">

                    <div className="text-right">
                        <h1 className="text-lg font-semibold text-gray-800">
                            Hello, {user?.name}
                        </h1>

                        <p className="text-xs text-gray-500">
                            {user?.email}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* Main Dashboard Area */}
            <main className="p-8">

                {loading && (
                    <p className="text-gray-600">
                        Loading...
                    </p>
                )}

                {!loading && error && (
                    <p className="text-red-600">
                        {error}
                    </p>
                )}

                {!loading && !error && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-[80vh]">

                    </div>
                )}

            </main>

        </div>
    );
}