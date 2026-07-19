"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/utils/apiFetch";

export default function RegisterCard() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [panNumber, setPanNumber] = useState("");
    const [dematClientId, setDematClientId] = useState("");
    const [dematDpId, setDematDpId] = useState("");

    const [bankAccountNo, setBankAccountNo] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [bankName, setBankName] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    async function handleRegister() {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const data = await apiFetch("/auth/register", {
                method: "POST",
                bodyData: {
                    name,
                    email,
                    phoneNumber,
                    panNumber,
                    dematClientId,
                    dematDpId,
                    bankAccountNo,
                    ifscCode,
                    bankName,
                },
            });

            setSuccess(data.message || "Registration successful!");

            await new Promise((resolve) => setTimeout(resolve, 5000));

            router.push("/login");
        }
        catch (err: any) {
            setError(err.message || "Unable to connect to server.");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 px-4 py-10">

            <div className="w-full max-w-5xl rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl">

                <h1 className="text-3xl font-bold text-center text-gray-900">
                    Welcome!
                </h1>

                <p className="mt-2 mb-8 text-center text-gray-500">
                    Create your account
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Mobile Number
                        </label>

                        <input
                            type="text"
                            value={phoneNumber}
                            autoComplete="off"
                            placeholder="Enter your 10 digit mobile number"
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            autoComplete="off"
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            PAN Number
                        </label>

                        <input
                            type="text"
                            value={panNumber}
                            autoComplete="off"
                            placeholder="Enter your PAN number"
                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Full Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            autoComplete="off"
                            placeholder="Enter your full name"
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Demat DP ID
                        </label>

                        <input
                            type="text"
                            value={dematDpId}
                            autoComplete="off"
                            placeholder="Enter your Demat DP ID"
                            onChange={(e) => setDematDpId(e.target.value.toUpperCase())}
                            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Demat Client ID
                        </label>

                        <input
                            type="text"
                            value={dematClientId}
                            autoComplete="off"
                            placeholder="Enter your Demat Client ID"
                            onChange={(e) => setDematClientId(e.target.value.toUpperCase())}
                            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Bank Account Number
                        </label>

                        <input
                            type="text"
                            value={bankAccountNo}
                            autoComplete="off"
                            placeholder="Enter your bank account number"
                            onChange={(e) => setBankAccountNo(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            IFSC Code
                        </label>

                        <input
                            type="text"
                            value={ifscCode}
                            autoComplete="off"
                            placeholder="Enter IFSC code"
                            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Bank Name
                        </label>

                        <input
                            type="text"
                            value={bankName}
                            autoComplete="off"
                            placeholder="Enter your bank name"
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                </div>

                <button
                    disabled={loading}
                    onClick={handleRegister}
                    className="mt-8 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                {success && (
                    <p className="mt-5 text-center text-sm font-medium text-green-600">
                        {success}
                    </p>
                )}

                {error && (
                    <p className="mt-5 text-center text-sm font-medium text-red-600">
                        {error}
                    </p>
                )}

                <div className="mt-6 text-center text-gray-700">
                    <span>Already have an account? </span>

                    <Link
                        href="/login"
                        className="font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
                    >
                        Login
                    </Link>
                </div>

            </div>

        </div>
    );
}