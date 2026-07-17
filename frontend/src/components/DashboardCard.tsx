"use client";

import { Ruthie } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Upon login, the backend sends the user data in the response.
// This interface defines the structure of that user data.
interface User {
    name: string;
    email: string;
    phoneNumber: string;
}

export default function DashboardCard() {
    const [user, setUser] = useState<User | null>(null);        // State to hold user data
    const [loading, setLoading] = useState(true);               // State for loading status, true while fetching user data, false once fetched
    const [error, setError] = useState("");                     // State for error messages
    const [role, setRole] = useState("unknown");

    const router = useRouter();                                 // Navigation hook to programmatically navigate between pages

    // Fetch the authenticated user's profile when the dashboard first mounts.
    // If the session is invalid or expired, redirect to the session-ended page.
    useEffect(() => {
        // Handle fetch request to get logged-in user profile
        async function fetchUser() {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
                    {
                        credentials: "include",     // Include cookies to maintain session
                    }
                );

                if (response.status === 401) {
                    router.push("/session-ended?reason=expired");
                    return;
                }
                if (response.status === 403) {
                    const data = await response.json();
                    router.push(`/session-ended?reason=${data.status.toLowerCase()}`);
                    return;
                }

                if (!response.ok) {
                    setError("Something went wrong.");
                    return;
                }

                // If response is valid, parse user data
                if (response.ok) {
                    const data = await response.json();

                    if (data.role !== "CLIENT") {
                        router.replace("/admin");
                        return;
                    }

                    setUser(data.user);
                    setRole(data.role);
                } else {
                    // Else session is expired
                    router.push("/session-ended?reason=expired");   // Session expired with reason - expired
                }
            } catch {
                setError("Unable to connect to the server.");
            } finally {
                setLoading(false);          // Finish loading
            }
        }

        fetchUser();
    }, [router]);

    // Handle user logout, send a POST request to the backend to terminate the session.
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

    // Render different UI based on the loading and error states.
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

    // Render the main dashboard UI once user data is fetched and there are no errors.
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

                        <p className="text-xs text-gray-500">
                            {role}
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