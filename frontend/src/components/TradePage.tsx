"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/apiFetch";

interface Company {
    companyCode: string;
    companyName: string;
    indicativePrice: string;
    minQty: string;
}

export default function TradePage() {
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [processing, setProcessing] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    useEffect(() => {
        fetchActiveCompanies();
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

    async function fetchActiveCompanies(page: number = 1) {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                page: page.toString(),
                limit: "5",
            });

            const data = await apiFetch(`/client/companies?${params.toString()}`);

            setCompanies(data.companies);
            setPagination(data.pagination);

            const initialQuantities: Record<string, number> = {};

            data.companies.forEach((company: Company) => {
                initialQuantities[company.companyCode] = Number(company.minQty);
            });

            setQuantities(prev => {
                const updated = { ...prev };

                data.companies.forEach((company: Company) => {
                    if (!(company.companyCode in updated)) {
                        updated[company.companyCode] = Number(company.minQty);
                    }
                });

                return updated;
            });
        } catch (err) {
            handleError(err, "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    async function createTransaction(company: Company, companyCode: string, type: "BUY" | "SELL") {
        const qty = quantities[companyCode];

        // Perform fast local UI boundary assertions first
        if (qty < Number(company.minQty)) {
            alert(`Minimum quantity is ${company.minQty}`);
            return;
        }

        const confirmed = window.confirm(`Are you sure you want to create this ${type} transaction?`);
        if (!confirmed) return;

        try {
            setProcessing(companyCode);

            const data = await apiFetch("/client/transactions", {
                method: "POST",
                bodyData: {
                    companyCode,
                    type,
                    quantity: qty
                }
            });

            // Display success details generated directly by your backend endpoint
            alert(data.message || "Transaction order processed successfully.");
        }
        catch (err) {
            handleError(err, "Unable to process transaction.");
        }
        finally {
            setProcessing(null);
        }
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-5">
                    Buy / Sell Shares
                </h2>

                <p className="text-gray-600">
                    Loading companies...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-5">
                    Buy / Sell Shares
                </h2>

                <p className="text-red-600">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    Buy / Sell Shares
                </h2>

                <div className="flex items-center gap-3">
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => fetchActiveCompanies(pagination.page - 1)}
                        className="rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"                    >
                        ← Previous
                    </button>

                    <span className="text-sm font-medium text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => fetchActiveCompanies(pagination.page + 1)}
                        className="rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next →
                    </button>
                </div>
            </div>

            {companies.length === 0 ? (
                <p className="text-gray-600">
                    No companies available.
                </p>
            ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Index
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Company
                                </th>

                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Price
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Minimum Qty
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Quantity
                                </th>

                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {companies.map((company, index) => (
                                <tr
                                    key={company.companyCode}
                                    className="border-t border-gray-100 hover:bg-blue-100 transition-colors"
                                >
                                    <td className="px-5 py-4 text-lg font-bold text-gray-900">
                                        {(pagination.page - 1) * pagination.limit + index + 1}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="text-base font-bold text-black">
                                            {company.companyName}
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            {company.companyCode}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-right font-bold text-gray-900">
                                        ₹{company.indicativePrice}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                                            {company.minQty} Shares
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-black">
                                        <input
                                            type="number"
                                            min={company.minQty}
                                            value={quantities[company.companyCode] ?? company.minQty}
                                            onChange={(e) =>
                                                setQuantities((prev) => ({
                                                    ...prev,
                                                    [company.companyCode]: Number(e.target.value),
                                                }))
                                            }
                                            className="w-24 border rounded px-2 py-1"
                                        />
                                    </td>

                                    <td className="p-3">
                                        <div className="flex gap-2">

                                            <button
                                                disabled={processing === company.companyCode}
                                                onClick={() => createTransaction(company, company.companyCode, "BUY")}
                                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                Buy
                                            </button>

                                            <button
                                                disabled={processing === company.companyCode}
                                                onClick={() => createTransaction(company, company.companyCode, "SELL")}
                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                Sell
                                            </button>

                                        </div>
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