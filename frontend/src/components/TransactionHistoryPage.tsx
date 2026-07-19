"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/apiFetch";

interface Transaction {
    id: number;
    type: "BUY" | "SELL";
    quantity: number;
    priceAtOrder: string;
    totalAmount: string;
    status: "PENDING" | "UNDER_PROCESS" | "COMPLETED" | "REJECTED" | "CANCELLED";
    createdAt: string;
    company: {
        companyCode: string;
        companyName: string;
    };
}

export default function TransactionHistoryPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    useEffect(() => {
        fetchUserTransactions();
    }, []);

    // Centralized route and notification mapper for this page
    function handleError(err: any, fallbackMessage: string) {
        if (err.message === "session_ended") {
            const redirectReason = err.reason || "expired";
            router.push(`/session-ended?reason=${redirectReason}`);
            return;
        }
        console.error(err);
        setError(err.message || fallbackMessage);
        alert(err.message || fallbackMessage);
    }

    async function fetchUserTransactions(page: number = 1) {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                page: page.toString(),
                limit: "5",
            });

            const data = await apiFetch(
                `/client/transactions?${params.toString()}`
            );

            setTransactions(data.transactions);
            setPagination(data.pagination);
        } catch (err) {
            handleError(err, "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    async function cancelTransaction(id: number) {
        const confirmed = window.confirm("Are you sure you want to cancel this order?");
        if (!confirmed) return;

        try {
            const data = await apiFetch(`/client/transactions/${id}/cancel`, {
                method: "PATCH",
            });

            // Display success message returned by your backend API
            alert(data.message || "Order successfully cancelled.");
            await fetchUserTransactions();
        } catch (err) {
            handleError(err, "Unable to connect to server.");
        }
    }

    function getStatusColor(status: Transaction["status"]) {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "UNDER_PROCESS":
                return "bg-blue-100 text-blue-800";
            case "COMPLETED":
                return "bg-green-100 text-green-800";
            case "REJECTED":
                return "bg-red-100 text-red-800";
            case "CANCELLED":
                return "bg-gray-100 text-gray-700";
        }
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    Transaction History
                </h2>

                <div className="flex items-center gap-3">
                    <button
                        disabled={pagination.page === 1 || loading}
                        onClick={() =>
                            fetchUserTransactions(pagination.page - 1)
                        }
                        className="rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        ← Previous
                    </button>

                    <span className="text-sm font-medium text-slate-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                        disabled={
                            pagination.page === pagination.totalPages || loading
                        }
                        onClick={() =>
                            fetchUserTransactions(pagination.page + 1)
                        }
                        className="rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next →
                    </button>

                    <button
                        disabled={loading}
                        onClick={() =>
                            fetchUserTransactions(pagination.page)
                        }
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-gray-600">
                    Loading transactions...
                </p>
            ) : error ? (
                <p className="text-red-600">
                    {error}
                </p>
            ) : transactions.length === 0 ? (
                <p className="text-gray-600">
                    No transactions found.
                </p>
            ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Company
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Type
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Qty
                                </th>

                                <th className="w-32 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Share Price
                                </th>
                                <th className="w-32 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Total
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Ordered On
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {transactions.map((transaction) => (
                                <tr
                                    key={transaction.id}
                                    className="border-t border-gray-100 hover:bg-blue-100 transition-colors"
                                >
                                    <td className="px-5 py-4">
                                        <div className="text-base font-bold text-black">
                                            {transaction.company.companyName}
                                        </div>

                                        <div className="text-sm text-gray-700">
                                            {transaction.company.companyCode}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`font-semibold ${transaction.type === "BUY"
                                                ? "text-green-700"
                                                : "text-red-700"
                                                }`}
                                        >
                                            {transaction.type}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-gray-900 font-medium">
                                        {transaction.quantity.toLocaleString("en-IN")}
                                    </td>

                                    <td className="w-32 px-5 py-4 text-right font-semibold text-gray-900">
                                        ₹{Number(transaction.priceAtOrder).toLocaleString("en-IN")}
                                    </td>

                                    <td className="w-32 px-5 py-4 text-right font-semibold text-gray-900">
                                        ₹{Number(transaction.totalAmount).toLocaleString("en-IN")}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                                                transaction.status
                                            )}`}
                                        >
                                            {transaction.status.replaceAll("_", " ")}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-gray-800">
                                        {formatDate(transaction.createdAt)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <button
                                            disabled={transaction.status !== "PENDING"}
                                            className={`px-3 py-1 rounded text-white font-medium ${transaction.status === "PENDING"
                                                ? "bg-red-600 hover:bg-red-700"
                                                : "bg-gray-400 cursor-not-allowed"
                                                }`}
                                            onClick={() => cancelTransaction(transaction.id)}
                                        >
                                            CANCEL
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}