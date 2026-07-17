"use client"

import { useRouter } from "next/navigation"
import { useState } from "react";
import Link from "next/link";

export default function LoginCard() {
    const [phoneNumber, setPhoneNumber] = useState("");     // State to hold phone number
    const [loading, setLoading] = useState(true);           // State for loading status, true while fetching user data, false once fetched
    const [error, setError] = useState("");                 // State for error messages

    const router = useRouter();                             // Navigation hook to programmatically navigate between pages

    // Send OTP request to the backend when the user clicks the "Send OTP" button.
    async function handleSendOtp() {
        // Reset error and set loading state
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/request-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "phoneNumber": phoneNumber,
                    })
                }
            );

            // Parse the response from the backend
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            // Success
            // Store challenge in local storage before we move to verify-otp page, as router push will cause a loss of state.
            localStorage.setItem("challenge", data.challenge);
            router.push("/verify-otp");
        }
        catch (err) {
            console.error(err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Unable to connect to server.")
            }
        }
        finally {
            setLoading(false);
        }
    }

    // Render the login form UI
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-96">
            <h1 className="text-3xl text-center font-bold mb-2 text-black">
                Welcome back!
            </h1>

            <p className="text-center text-gray-500 mb-6">
                Sign in to continue
            </p>

            <input
                className="w-full border rounded-md p-2 mb-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
                value={phoneNumber}
                autoComplete="off"
                onChange={(e) => { setPhoneNumber(e.target.value) }}
            />

            {error && (
                <p className="text-red-600 text-sm mb-4 text-center font-medium">
                    {error}
                </p>
            )}

            <button
                className="w-full bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 transition-colors font-medium shadow-sm"
                onClick={handleSendOtp}
            >
                Send OTP
            </button>

            <div className="mt-6 text-center text-gray-700 text-sm">
                <span>Don't have an account? </span>
                <Link
                    href="/register"
                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition"
                >
                    Register
                </Link>
            </div>
        </div>
    );
}