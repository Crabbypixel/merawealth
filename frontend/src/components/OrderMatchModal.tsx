"use client";

import { apiFetch } from "@/utils/apiFetch";
import { checkMatches, MatchCheckResult, MatchInput, MatchOrderRow } from "@/utils/orderMatch";
import { useEffect, useState } from "react";

interface MatchCompany {
    companyCode: string;
    companyName: string;
    sellOrders: number;
    buyOrders: number;
    sellPending: number;
    buyPending: number;
}

interface CompanyBook {
    company: { companyCode: string; companyName: string };
    sellers: MatchOrderRow[];
    buyers: MatchOrderRow[];
    usedMatchIds: string[];
}

type ApiError = Error & { status?: number; data?: { errors?: { message: string }[] } };

interface Props {
    onClose: () => void;
    // Called with errors so the dashboard can redirect on an ended session.
    onError: (err: unknown, fallbackMessage: string) => void;
}

// Manual order matching: a list of companies, then a Sellers / Buyers screen for one company.
export default function OrderMatchModal({ onClose, onError }: Props) {
    const [companies, setCompanies] = useState<MatchCompany[] | null>(null);
    const [book, setBook] = useState<CompanyBook | null>(null);
    const [inputs, setInputs] = useState<Record<number, MatchInput>>({});
    const [saved, setSaved] = useState<MatchCheckResult | null>(null);   // result of the last "Save", cleared on any edit
    const [serverProblems, setServerProblems] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        loadCompanies();
    }, []);

    async function loadCompanies() {
        try {
            setLoading(true);
            const data = await apiFetch("/admin/order-match/companies");
            setCompanies(data.companies);
        } catch (err) {
            onError(err, "Unable to load companies for order matching.");
        } finally {
            setLoading(false);
        }
    }

    async function openCompany(companyCode: string) {
        try {
            setLoading(true);
            const data = await apiFetch(`/admin/order-match/${encodeURIComponent(companyCode)}`);
            setBook(data);
            setInputs({});
            setSaved(null);
            setServerProblems([]);
        } catch (err) {
            onError(err, "Unable to load orders for this company.");
        } finally {
            setLoading(false);
        }
    }

    function backToCompanies() {
        const hasEntries = Object.values(inputs).some((i) => i.matchQuantity.trim() !== "" || i.matchId.trim() !== "");
        if (hasEntries && !window.confirm("Leave this company? What you typed has not been confirmed and will be lost.")) {
            return;
        }
        setBook(null);
        setInputs({});
        setSaved(null);
        setServerProblems([]);
        loadCompanies();
    }

    function closeModal() {
        const hasEntries = Object.values(inputs).some((i) => i.matchQuantity.trim() !== "" || i.matchId.trim() !== "");
        if (hasEntries && !window.confirm("Close order matching? What you typed has not been confirmed and will be lost.")) {
            return;
        }
        onClose();
    }

    function updateInput(id: number, field: keyof MatchInput, value: string) {
        setInputs((prev) => ({
            ...prev,
            [id]: { ...(prev[id] ?? { matchQuantity: "", matchId: "" }), [field]: value }
        }));
        setSaved(null);
        setServerProblems([]);
    }

    function allOrders() {
        return book ? [...book.sellers, ...book.buyers] : [];
    }

    // "Save": check the entries and show the new pending quantities. Nothing is stored.
    function handleSave() {
        if (!book) return;
        setServerProblems([]);
        setSaved(checkMatches(allOrders(), inputs, book.usedMatchIds));
    }

    // "Confirm": store the matches on the server.
    async function handleConfirm() {
        if (!book || !saved || saved.problems.length > 0) return;

        const summary = saved.groups
            .map((g) => `${g.matchId}: ${g.sellTotal} shares`)
            .join("\n");
        if (!window.confirm(`Confirm these matches for ${book.company.companyName}?\n\n${summary}\n\nThis cannot be undone.`)) {
            return;
        }

        try {
            setConfirming(true);
            const data = await apiFetch(`/admin/order-match/${encodeURIComponent(book.company.companyCode)}/confirm`, {
                method: "POST",
                bodyData: { entries: saved.entries }
            });
            alert(`${data.message}\nCompleted: ${data.ordersCompleted}, partially completed: ${data.ordersPartiallyCompleted}.`);
            await openCompany(book.company.companyCode);
        } catch (err) {
            const apiError = err as ApiError;
            if (apiError.status === 400 && Array.isArray(apiError.data?.errors)) {
                setServerProblems(apiError.data.errors.map((e) => e.message));
                setSaved(null);
                return;
            }
            if (apiError.status === 409) {
                alert(apiError.message);
                await openCompany(book.company.companyCode);
                return;
            }
            onError(err, "Unable to confirm order matching.");
        } finally {
            setConfirming(false);
        }
    }

    const problemIds = new Set(saved?.problems.map((p) => p.transactionId).filter((id) => id !== undefined));

    function pendingAfter(order: MatchOrderRow) {
        const entry = saved?.entries.find((e) => e.transactionId === order.id);
        if (!saved || !entry || saved.problems.length > 0) return order.pendingQuantity;
        return order.pendingQuantity - entry.matchQuantity;
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }

    function renderTable(title: string, rows: MatchOrderRow[], tone: "red" | "blue") {
        return (
            <div className="mb-8">
                <h3 className={`mb-3 text-lg font-bold ${tone === "red" ? "text-red-700" : "text-blue-700"}`}>
                    {title} ({rows.length})
                </h3>

                {rows.length === 0 ? (
                    <p className="text-sm text-slate-500">No {title.toLowerCase()} waiting.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-left">
                                <tr>
                                    <th className="px-3 py-2 font-semibold text-slate-600">Order ID</th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">Order date</th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">Client</th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">Price</th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">Order qty</th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">Approved</th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">Matched so far</th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">Match qty</th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">Match ID</th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">Pending</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((order) => {
                                    const input = inputs[order.id] ?? { matchQuantity: "", matchId: "" };
                                    const hasProblem = problemIds.has(order.id);
                                    return (
                                        <tr
                                            key={order.id}
                                            className={`border-t border-slate-200 ${hasProblem ? "bg-red-50" : ""}`}
                                        >
                                            <td className="px-3 py-2 font-semibold">#{order.id}</td>
                                            <td className="px-3 py-2">{formatDate(order.createdAt)}</td>
                                            <td className="px-3 py-2">{order.clientName}</td>
                                            <td className="px-3 py-2">₹{Number(order.priceAtOrder).toLocaleString("en-IN")}</td>
                                            <td className="px-3 py-2">{order.quantity.toLocaleString("en-IN")}</td>
                                            <td className="px-3 py-2">{order.approvedQuantity.toLocaleString("en-IN")}</td>
                                            <td className="px-3 py-2">{order.matchedQuantity.toLocaleString("en-IN")}</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={order.pendingQuantity}
                                                    step={1}
                                                    value={input.matchQuantity}
                                                    onChange={(e) => updateInput(order.id, "matchQuantity", e.target.value)}
                                                    className="w-24 rounded-md border border-slate-300 px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    maxLength={20}
                                                    value={input.matchId}
                                                    onChange={(e) => updateInput(order.id, "matchId", e.target.value)}
                                                    className="w-28 rounded-md border border-slate-300 px-2 py-1 uppercase"
                                                />
                                            </td>
                                            <td className="px-3 py-2 font-semibold">{pendingAfter(order).toLocaleString("en-IN")}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[92vh] w-full max-w-7xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {book ? `Order Match: ${book.company.companyName}` : "Order Match"}
                        </h2>
                        {book && (
                            <p className="text-sm text-slate-500">
                                Matching date: {formatDate(new Date().toISOString())}. Use the same Match ID for the sellers and buyers matched together.
                            </p>
                        )}
                    </div>
                    <button onClick={closeModal} className="text-2xl text-slate-500 hover:text-slate-700">×</button>
                </div>

                {loading && <p className="text-slate-600">Loading...</p>}

                {!loading && !book && companies && (
                    companies.length === 0 ? (
                        <p className="text-slate-600">
                            No company has both buy and sell orders waiting to be matched.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Company</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Sell orders (shares pending)</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Buy orders (shares pending)</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((c) => (
                                        <tr key={c.companyCode} className="border-t border-slate-200">
                                            <td className="px-4 py-3">
                                                <p className="font-semibold">{c.companyName}</p>
                                                <p className="text-xs text-slate-500">{c.companyCode}</p>
                                            </td>
                                            <td className="px-4 py-3">{c.sellOrders} ({c.sellPending.toLocaleString("en-IN")})</td>
                                            <td className="px-4 py-3">{c.buyOrders} ({c.buyPending.toLocaleString("en-IN")})</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => openCompany(c.companyCode)}
                                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                >
                                                    Match orders
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {!loading && book && (
                    <>
                        {renderTable("Sellers", book.sellers, "red")}
                        {renderTable("Buyers", book.buyers, "blue")}

                        {saved && saved.groups.length > 0 && (
                            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                                <p className="mb-2 font-semibold text-slate-700">Match ID totals</p>
                                {saved.groups.map((g) => (
                                    <p key={g.matchId} className={g.sellTotal === g.buyTotal ? "text-slate-700" : "text-red-700"}>
                                        {g.matchId}: sellers {g.sellTotal}, buyers {g.buyTotal}
                                    </p>
                                ))}
                            </div>
                        )}

                        {(saved?.problems.length || serverProblems.length) ? (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                <p className="mb-2 font-semibold">Please fix these before confirming:</p>
                                <ul className="list-disc pl-5">
                                    {[...(saved?.problems.map((p) => p.message) ?? []), ...serverProblems].map((m, i) => (
                                        <li key={i}>{m}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : saved ? (
                            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                                Looks good. Pending quantities above show what is left after this match. Click Confirm to save it.
                            </div>
                        ) : null}

                        <div className="flex items-center justify-between">
                            <button
                                onClick={backToCompanies}
                                className="rounded-lg border border-slate-300 px-6 py-2 hover:bg-slate-100"
                            >
                                ← Back to companies
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    className="rounded-lg border border-blue-600 px-6 py-2 font-medium text-blue-700 hover:bg-blue-50"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!saved || saved.problems.length > 0 || confirming}
                                    title={!saved ? "Click Save first to check your entries" : undefined}
                                    className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    {confirming ? "Confirming..." : "Confirm"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
