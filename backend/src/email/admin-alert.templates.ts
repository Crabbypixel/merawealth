import { TransactionType } from "@prisma/client";

// HTML for the emails admins get when a client registers or places an order.
// Pure functions (no database, no mail server) so they can be unit tested.

export interface NewRegistrationAlert {
    userId: number;
    name: string;
    phoneNumber: string;
    email: string;
    panNumber: string | null;
    dematClientId: string | null;
    dematDpId: string | null;
    bankName: string | null;
    bankAccountNo: string | null;
    ifscCode: string | null;
    registeredAt: Date;
    // Clients waiting for approval, including this one.
    pendingApprovals: number;
    dashboardUrl: string;
}

export interface OpenSide {
    orders: number;
    shares: number;
}

export interface NewOrderAlert {
    orderId: number;
    type: TransactionType;
    placedAt: Date;
    companyName: string;
    companyCode: string;
    quantity: number;
    price: string;
    totalAmount: string;
    client: {
        id: number;
        name: string;
        phoneNumber: string;
        email: string;
        dematClientId: string | null;
        dematDpId: string | null;
        clientSince: Date;
        // Orders the client placed before this one, any status.
        previousOrders: number;
    };
    // Open orders for this company, this one included: PENDING by ordered quantity,
    // UNDER_PROCESS and PARTIALLY_COMPLETED by pending quantity.
    openBuy: OpenSide;
    openSell: OpenSide;
    // Orders across all companies waiting for the admin to verify, this one included.
    ordersToVerify: number;
    dashboardUrl: string;
}

const BUY_COLOR = "#1d4ed8";
const SELL_COLOR = "#dc2626";
const REGISTER_COLOR = "#0f766e";

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// "13 Oct 2026, 3:45 pm IST". The server clock may be UTC, so the zone is fixed.
export function formatIst(date: Date): string {
    const text = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(date);
    return `${text} IST`;
}

export function formatIstDate(date: Date): string {
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

// "₹1,85,000.00" in the Indian digit grouping.
export function formatRupees(amount: string): string {
    const value = Number(amount);
    if (!Number.isFinite(value)) return `₹${amount}`;
    return "₹" + value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Only the last 4 digits, so a forwarded email doesn't carry the full account number.
export function maskAccount(accountNo: string | null): string | null {
    if (!accountNo) return null;
    const last4 = accountNo.slice(-4);
    return accountNo.length > 4 ? `XXXX ${last4}` : last4;
}

function plural(count: number, word: string): string {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}

const NOT_PROVIDED = `<span style="color:#94a3b8;">Not provided</span>`;

// Values are escaped here. Pass `html` for markup built in this file.
type Cell = string | null | { html: string };

function cell(value: Cell): string {
    if (value === null || value === "") return NOT_PROVIDED;
    if (typeof value === "string") return escapeHtml(value);
    return value.html;
}

function row(label: string, value: Cell): string {
    return `
        <tr>
            <td style="padding:9px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;width:42%;vertical-align:top;">${label}</td>
            <td style="padding:9px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${cell(value)}</td>
        </tr>`;
}

function section(title: string, rows: string): string {
    return `
        <p style="margin:28px 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;">${title}</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;">${rows}</table>`;
}

function badge(text: string, color: string): string {
    return `<span style="display:inline-block;padding:3px 10px;border-radius:999px;background:${color};color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.5px;">${text}</span>`;
}

function layout(opts: {
    color: string;
    label: string;
    headline: string;
    summary: string;
    body: string;
    buttonText: string;
    dashboardUrl: string;
}): string {
    return `
<div style="background:#f1f5f9;padding:24px 12px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="background:${opts.color};padding:18px 28px;">
      <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9;">MeraWealth admin alert</p>
      <p style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;">${opts.label}</p>
    </div>
    <div style="padding:24px 28px 28px;color:#0f172a;">
      <p style="margin:0;font-size:17px;line-height:1.5;">${opts.headline}</p>
      <p style="margin:6px 0 0;font-size:14px;line-height:1.5;color:#475569;">${opts.summary}</p>
      ${opts.body}
      <div style="margin-top:30px;">
        <a href="${escapeHtml(opts.dashboardUrl)}" style="display:inline-block;background:${opts.color};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:8px;">${opts.buttonText}</a>
      </div>
    </div>
    <div style="padding:14px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;color:#94a3b8;font-size:12px;line-height:1.5;">
      You get this email because you are a MeraWealth admin. It contains client details, so please don't forward it.
    </div>
  </div>
</div>`;
}

export function newRegistrationEmail(a: NewRegistrationAlert): { subject: string; html: string } {
    const name = escapeHtml(a.name);
    const others = a.pendingApprovals - 1;

    const body =
        section("Client details",
            row("Name", a.name) +
            row("Client ID", String(a.userId)) +
            row("Phone", a.phoneNumber) +
            row("Email", a.email) +
            row("Registered on", formatIst(a.registeredAt)) +
            row("Status", { html: badge("PENDING APPROVAL", "#d97706") })) +
        section("KYC details",
            row("PAN", a.panNumber) +
            row("Demat client ID", a.dematClientId) +
            row("DP ID", a.dematDpId)) +
        section("Bank details",
            row("Bank", a.bankName) +
            row("Account number", maskAccount(a.bankAccountNo)) +
            row("IFSC", a.ifscCode));

    return {
        subject: `New registration: ${a.name} is waiting for approval`,
        html: layout({
            color: REGISTER_COLOR,
            label: "New client registration",
            headline: `<strong>${name}</strong> registered on MeraWealth and is waiting for approval.`,
            summary: others > 0
                ? `${plural(others, "other client")} ${others === 1 ? "is" : "are"} also waiting, ${a.pendingApprovals} in total.`
                : "No other clients are waiting for approval.",
            body,
            buttonText: "Review in admin dashboard",
            dashboardUrl: a.dashboardUrl,
        }),
    };
}

export function newOrderEmail(a: NewOrderAlert): { subject: string; html: string } {
    const isBuy = a.type === TransactionType.BUY;
    const color = isBuy ? BUY_COLOR : SELL_COLOR;
    const verb = isBuy ? "buy" : "sell";
    const name = escapeHtml(a.client.name);
    const company = escapeHtml(a.companyName);
    const typeHtml = `<span style="color:${color};font-weight:700;">${a.type}</span>`;
    const others = a.ordersToVerify - 1;

    const side = (s: OpenSide, sideColor: string) => ({
        html: s.orders === 0
            ? `<span style="color:#94a3b8;">None</span>`
            : `<span style="color:${sideColor};">${plural(s.shares, "share")}</span> <span style="color:#64748b;font-weight:400;">(${plural(s.orders, "order")})</span>`,
    });

    const body =
        section("Order",
            row("Order ID", `#${a.orderId}`) +
            row("Placed on", formatIst(a.placedAt)) +
            row("Type", { html: typeHtml }) +
            row("Company", `${a.companyName} (${a.companyCode})`) +
            row("Quantity", plural(a.quantity, "share")) +
            row("Price per share", formatRupees(a.price)) +
            row("Total value", { html: `<span style="color:${color};font-size:16px;">${escapeHtml(formatRupees(a.totalAmount))}</span>` }) +
            row("Status", { html: badge("PENDING", "#d97706") })) +
        section("Client",
            row("Name", a.client.name) +
            row("Client ID", String(a.client.id)) +
            row("Phone", a.client.phoneNumber) +
            row("Email", a.client.email) +
            row("Demat client ID", a.client.dematClientId) +
            row("DP ID", a.client.dematDpId) +
            row("Client since", formatIstDate(a.client.clientSince)) +
            row("Earlier orders", a.client.previousOrders === 0 ? "None, this is the first order" : String(a.client.previousOrders))) +
        section(`Open orders for ${company}`,
            row(`<span style="color:${BUY_COLOR};font-weight:700;">BUY</span> side`, side(a.openBuy, BUY_COLOR)) +
            row(`<span style="color:${SELL_COLOR};font-weight:700;">SELL</span> side`, side(a.openSell, SELL_COLOR)));

    return {
        subject: `New ${a.type} order #${a.orderId}: ${plural(a.quantity, "share")} of ${a.companyName} by ${a.client.name}`,
        html: layout({
            color,
            label: `New ${a.type} order`,
            headline: `<strong>${name}</strong> wants to <strong style="color:${color};">${verb}</strong> <strong>${plural(a.quantity, "share")}</strong> of <strong>${company}</strong> for <strong>${escapeHtml(formatRupees(a.totalAmount))}</strong>.`,
            summary: others > 0
                ? `${plural(others, "other order")} ${others === 1 ? "is" : "are"} also waiting to be verified, ${a.ordersToVerify} in total.`
                : "This is the only order waiting to be verified.",
            body,
            buttonText: "Verify in admin dashboard",
            dashboardUrl: a.dashboardUrl,
        }),
    };
}
