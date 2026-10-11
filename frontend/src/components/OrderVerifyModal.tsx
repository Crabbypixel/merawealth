"use client";

import { apiFetch } from "@/utils/apiFetch";
import { useState } from "react";

export interface VerifyOrder {
    id: number;
    type: "BUY" | "SELL";
    quantity: number;
    priceAtOrder: string;
    totalAmount: string;
    createdAt: string;
    user: { name: string; email: string; phoneNumber: string };
    company: { companyName: string };
}

interface Props {
    order: VerifyOrder;
    onClose: () => void;
    onDone: () => void;      // called after a successful approve or reject
    onError: (err: unknown, fallbackMessage: string) => void;
}

// "View & Verify" for a PENDING order: the admin sets the approved quantity and approves, or rejects.
export default function OrderVerifyModal({ order, onClose, onDone, onError }: Props) {
    const [approvedQuantity, setApprovedQuantity] = useState(String(order.quantity));
    const [saving, setSaving] = useState(false);

    const qty = Number(approvedQuantity);
    const qtyValid = Number.isInteger(qty) && qty >= 1 && qty <= order.quantity;

    async function submit(status: "UNDER_PROCESS" | "REJECTED") {
        const question = status === "UNDER_PROCESS"
            ? `Approve order #${order.id} with an approved quantity of ${qty}?`
            : `Reject order #${order.id}?`;
        if (!window.confirm(question)) return;

        try {
            setSaving(true);
            await apiFetch(`/admin/transactions/${order.id}`, {
                method: "PATCH",
                bodyData: status === "UNDER_PROCESS" ? { status, approvedQuantity: qty } : { status }
            });
            onDone();
        } catch (err) {
            onError(err, "Unable to update the order.");
        } finally {
            setSaving(false);
        }
    }

    const detail = (label: string, value: React.ReactNode) => (
        <div>
            <p className="text-xs uppercase text-slate-500">{label}</p>
            <p className="font-semibold text-slate-900">{value}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Verify Order #{order.id}</h2>
                    <button onClick={onClose} className="text-2xl text-slate-500 hover:text-slate-700">×</button>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-4 rounded-lg bg-slate-50 p-4">
                    {detail("Client", order.user.name)}
                    {detail("Contact", <>{order.user.email}<br />{order.user.phoneNumber}</>)}
                    {detail("Company", order.company.companyName)}
                    {detail("Type", order.type)}
                    {detail("Ordered quantity", order.quantity.toLocaleString("en-IN"))}
                    {detail("Price", `₹${Number(order.priceAtOrder).toLocaleString("en-IN")}`)}
                    {detail("Ordered on", new Date(order.createdAt).toLocaleString("en-IN"))}
                </div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Approved quantity (1 to {order.quantity.toLocaleString("en-IN")})
                </label>
                <input
                    type="number"
                    min={1}
                    max={order.quantity}
                    step={1}
                    value={approvedQuantity}
                    onChange={(e) => setApprovedQuantity(e.target.value)}
                    className="w-48 rounded-md border border-slate-300 px-3 py-2"
                />
                {!qtyValid && (
                    <p className="mt-2 text-sm text-red-600">
                        Enter a whole number between 1 and {order.quantity}.
                    </p>
                )}
                {qtyValid && (
                    <p className="mt-2 text-sm text-slate-600">
                        New total: ₹{(Number(order.priceAtOrder) * qty).toLocaleString("en-IN")}
                    </p>
                )}

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-300 px-6 py-2 hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={saving}
                        onClick={() => submit("REJECTED")}
                        className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white hover:bg-red-700 disabled:bg-slate-400"
                    >
                        Reject
                    </button>
                    <button
                        disabled={saving || !qtyValid}
                        onClick={() => submit("UNDER_PROCESS")}
                        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {saving ? "Saving..." : "Approve"}
                    </button>
                </div>
            </div>
        </div>
    );
}
