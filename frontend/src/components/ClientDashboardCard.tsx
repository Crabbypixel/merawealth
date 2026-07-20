"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TradePage from "./TradePage";
import TransactionHistoryPage from "./TransactionHistoryPage";
import { apiFetch } from "@/utils/apiFetch";
import { Menu, X, CircleUser } from "lucide-react";

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
    const [menuOpen, setMenuOpen] = useState(false);

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

        {/* Header */}
        <header className="border-b bg-white shadow-sm">
            <div className="mx-auto flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h1>

                    <p className="text-sm text-gray-500">
                        Manage your investments
                    </p>
                </div>

                {/* Desktop User Info */}
                <div className="hidden items-center gap-6 md:flex">

                    <div className="text-right">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {user?.name}
                        </h2>

                        <p className="text-sm text-gray-600">
                            {user?.email}
                        </p>

                        <p className="text-xs uppercase tracking-wide text-gray-500">
                            {role}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Logout
                    </button>

                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="rounded-md p-2 text-slate-700 md:hidden"
                >
                    <CircleUser size={28} />
                </button>

            </div>

            {/* Mobile User Menu */}
            {menuOpen && (
                <div className="border-t bg-white md:hidden">
                    <div className="space-y-4 px-4 py-4">

                        <div>
                            <h2 className="font-semibold text-gray-900">
                                {user?.name}
                            </h2>

                            <p className="text-sm text-gray-600">
                                {user?.email}
                            </p>

                            <p className="text-xs uppercase tracking-wide text-gray-500">
                                {role}
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            )}
        </header>

        {/* Navigation */}
        <nav className="border-b bg-white">
            <div className="flex flex-wrap justify-center gap-4 px-4 py-4 sm:px-6 lg:px-8">

                <button
                    onClick={() => setSelectedPage("trade")}
                    className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                        selectedPage === "trade"
                            ? "bg-blue-600 text-white shadow"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Buy / Sell Shares
                </button>

                <button
                    onClick={() => setSelectedPage("history")}
                    className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                        selectedPage === "history"
                            ? "bg-blue-600 text-white shadow"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Transaction History
                </button>

            </div>
        </nav>

        {/* Main Content */}
        <main className="p-4 sm:p-6 lg:p-8">
            {selectedPage === "trade" && <TradePage />}
            {selectedPage === "history" && <TransactionHistoryPage />}
        </main>

    </div>
);
}