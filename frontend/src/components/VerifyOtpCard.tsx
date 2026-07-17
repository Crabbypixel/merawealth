"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyOtpCard() {
    const [otp, setOtp] = useState("");                 // State to hold the OTP entered by the user         
    const [loading, setLoading] = useState(false);      // State for loading status
    const [error, setError] = useState("");             // State for error messages from backend

    const router = useRouter();                         // Navigation hook to programmatically navigate between pages

    // If challenge key exists, we can stay on this page, else redirect to login page.
    useEffect(() => {
        const challenge = localStorage.getItem("challenge");

        if(!challenge) {
            router.replace("/login");
        }
    }, [router]);

    // Handle OTP verification when the user clicks the "Verify OTP" button.
    async function handleVerifyOtp() {
        // Reset error and set loading state
        setLoading(true);
        setError("");

        // Retrieve the challenge from local storage
        const challenge = localStorage.getItem("challenge");

        if(challenge === null) {
            setError("Challenge missing.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "challenge" : challenge,
                        "otp": Number(otp)
                    })
                }
            );

            // Success
            // Parse the response from the backend
            const data = await response.json();

            // If user is verified, remove the challenge from local storge and route to dashboard
            if (data.success) {
                localStorage.removeItem("challenge");

                if(data.role === "CLIENT")
                    router.push("/dashboard");
                else if(data.role === "ADMIN")
                    router.push("/admin");
                
            } else {
                setError(data.message);
            }

        }
        catch(err) {
            console.error(err);

            if(err instanceof Error) {
                setError(err.message);
            } else {
                setError("Unable to connect to server.")
            }
        }
        finally {
            setLoading(false);
        }
    }

    // Render the OTP verification form UI
    return (
        /* Outer centering wrapper layout */
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            
            <div className="bg-white p-8 rounded-xl shadow-lg w-96">

                <h1 className="text-3xl text-center font-bold mb-2 text-black">
                    Verify OTP
                </h1>

                <p className="text-center text-gray-500 mb-6">
                    Enter the OTP sent to your registered number.
                </p>

                <input
                    className="w-full border rounded-md p-2 mb-4 text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter OTP"
                    value={otp}
                    autoComplete="off"
                    onChange={(e) => setOtp(e.target.value)}
                />

                <button
                    className="w-full bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    onClick={handleVerifyOtp}
                    disabled={loading || !otp}
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center mt-4">
                    <Link href="/login" className="text-blue-600 hover:underline text-sm">
                        Back to Login
                    </Link>
                </div>

                {error && (
                    <p className="text-red-600 text-sm mt-4 text-center">
                        {error}
                    </p>
                )}

            </div>
        </div>
    );
}
