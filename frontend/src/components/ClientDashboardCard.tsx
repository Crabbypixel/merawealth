"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TradePage from "./TradePage";
import TransactionHistoryPage from "./TransactionHistoryPage";
import { apiFetch } from "@/utils/apiFetch";

// Structure of user data received from the authentication profile route.
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
    const [selectedPage, setSelectedPage] = useState("trade");

    const router = useRouter();                                 // Navigation hook to programmatically navigate between pages

    // Centralized route and notification mapper for this component
    function handleError(err: any, fallbackMessage: string) {
        if (err.message === "session_ended") {
            const redirectReason = err.reason || "expired";
            router.push(`/session-ended?reason=${redirectReason}`);
            return;
        }
        console.error(err);
        setError(err.message || fallbackMessage);
    }

    // Fetch the authenticated user's profile when the dashboard first mounts.
    useEffect(() => {
        async function fetchUser() {
            try {
                setLoading(true);
                setError("");
                
                const data = await apiFetch("/auth/me");

                // Route alternative lifecycle states to session layouts
                if (data.user?.status && data.user.status !== "ACTIVE") {
                    router.push(`/session-ended?reason=${data.user.status.toLowerCase()}`);
                    return;
                }

                // Protect interface from unauthorized admin access routing loops
                if (data.role !== "CLIENT") {
                    router.replace("/admin");
                    return;
                }

                setUser(data.user);
                setRole(data.role);
            } catch (err) {
                handleError(err, "Unable to connect to the server.");
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [router]);

    // Handle user logout, send a POST request to the backend to terminate the session.
    async function handleLogout() {
        try {
            await apiFetch("/auth/logout", { method: "POST" });
            router.push("/session-ended?reason=logout");
        } catch (err) {
            console.error("Logout request failed:", err);
            // Fallback strategy: Force interface route reset on client failure
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

            <nav className="bg-white border-b px-8 py-3 flex justify-center gap-4">

                <button
                    onClick={() => setSelectedPage("trade")}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors font-medium ${selectedPage === "trade"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    Buy / Sell Shares
                </button>

                <button
                    onClick={() => setSelectedPage("history")}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors font-medium ${selectedPage === "history"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    Transaction History
                </button>

            </nav>

            {/* Main Dashboard Area */}
            <main className="p-8">

                <main className="p-8">
                    {selectedPage === "trade" && <TradePage />}
                    {selectedPage === "history" && <TransactionHistoryPage />}
                </main>

            </main>

        </div>
    );
}