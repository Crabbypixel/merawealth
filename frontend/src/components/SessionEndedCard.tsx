"use client"

import Link from "next/link";
import { useSearchParams } from "next/navigation";

// This component displays a message to the user when their session has ended, either due to logout or session expiration. It provides a link for the user to navigate back to the login page.
// See DashboardCard for more details on how the session is managed and how the user is redirected to this page when their session ends.
export default function SessionEndedCard() {
    const searchParams = useSearchParams();

    // DashboardCard:
    const reason = searchParams.get("reason");

    const statusContent = {
        logout: {
            title: "Logged out",
            message: "You have been logged out successfully.",
        },
        expired: {
            title: "Session expired",
            message: "Your session has expired. Please log in again.",
        },
        pending: {
            title: "Account pending approval",
            message: "Your account is awaiting administrator approval.",
        },
        rejected: {
            title: "Account rejected",
            message: "Your registration has been rejected.",
        },
        inactive: {
            title: "Account inactive",
            message: "Your account has been deactivated. Please contact the administrator.",
        },
    } as const;

    const { title, message } = statusContent[reason as keyof typeof statusContent] ?? statusContent.expired;

    // Render the session ended message UI
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">

            <div className="bg-white p-8 rounded-xl shadow-lg w-96">

                <h1 className="text-3xl font-bold text-center text-black mb-4">
                    {title}
                </h1>

                <p className="text-gray-600 text-center mb-8">
                    {message}
                </p>

                <Link
                    href="/login"
                    className="block w-full bg-blue-600 text-white rounded-md p-2 text-center hover:bg-blue-700 transition-colors"
                >
                    Go to Login
                </Link>

            </div>

        </div>
    );
}