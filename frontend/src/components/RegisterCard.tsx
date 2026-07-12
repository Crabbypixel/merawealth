"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterCard() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const router = useRouter();

    async function handleRegister() {
        console.log("Button clicked");
        console.log(process.env.NEXT_PUBLIC_API_URL);

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "name": name,
                        "phoneNumber": phoneNumber,
                        "email": email,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            // Success
            setSuccess(data.message);
            
            // Wait for 1 second
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Route to login
            router.push("/login");
        }
        catch (err) {
            console.error(err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Unable to connect to server");
            }
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
                <h1 className="text-3xl font-bold text-center text-gray-900">
                    Welcome!
                </h1>

                <p className="text-center text-gray-500 mt-2 mb-8">
                    Create your account
                </p>

                <input
                    className="w-full rounded-lg border border-gray-300 p-3 mb-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter your name"
                    value={name}
                    autoComplete="off"
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="w-full rounded-lg border border-gray-300 p-3 mb-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter your email"
                    value={email}
                    autoComplete="off"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="w-full rounded-lg border border-gray-300 p-3 mb-6 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    autoComplete="off"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />

                <button
                    className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold shadow-md transition duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
                    onClick={handleRegister}
                >
                    Register
                </button>

                {success && (
                    <p className="mt-4 text-center text-sm font-medium text-green-600">
                        {success}
                    </p>
                )}

                {error && (
                    <p className="mt-4 text-center text-sm font-medium text-red-600">
                        {error}
                    </p>
                )}

                <div className="mt-6 text-center text-gray-700">
                    <span>Already have an account? </span>
                    <Link
                        href="/login"
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}