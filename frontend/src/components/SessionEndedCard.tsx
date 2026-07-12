"use client"

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SessionEndedCard() {
    const searchParams = useSearchParams();

    const reason = searchParams.get("reason");

    const title = 
        reason === "logout" ? "Logged out" : "Session expired";

    const message = 
        reason === "logout" ? "You have been logged out successfully." : "Your session has expired. Please log in again.";


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