import { TransactionType } from "@prisma/client";
import {
    escapeHtml,
    formatIst,
    formatRupees,
    maskAccount,
    newOrderEmail,
    newRegistrationEmail,
    NewOrderAlert,
} from "./admin-alert.templates";

const order: NewOrderAlert = {
    orderId: 42,
    type: TransactionType.BUY,
    placedAt: new Date("2026-10-13T10:15:00Z"),
    companyName: "National Stock Exchange",
    companyCode: "NSEIL",
    quantity: 100,
    price: "1850",
    totalAmount: "185000",
    client: {
        id: 7,
        name: "Asha <b>Rao</b>",
        phoneNumber: "9876543210",
        email: "asha@example.com",
        dematClientId: "12345678",
        dematDpId: null,
        clientSince: new Date("2026-09-01T05:00:00Z"),
        previousOrders: 0,
    },
    openBuy: { orders: 2, shares: 150 },
    openSell: { orders: 0, shares: 0 },
    ordersToVerify: 3,
    dashboardUrl: "http://localhost:3000/admin",
};

describe("admin alert helpers", () => {
    it("escapes HTML", () => {
        expect(escapeHtml(`<a href="x">&'`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
    });

    it("shows India time whatever the server zone", () => {
        expect(formatIst(new Date("2026-10-13T10:15:00Z"))).toBe("13 Oct 2026, 3:45 pm IST");
    });

    it("formats rupees with Indian grouping", () => {
        expect(formatRupees("185000")).toBe("₹1,85,000.00");
        expect(formatRupees("1850.5")).toBe("₹1,850.50");
    });

    it("keeps only the last 4 digits of an account number", () => {
        expect(maskAccount("123456789012")).toBe("XXXX 9012");
        expect(maskAccount(null)).toBeNull();
    });
});

describe("newOrderEmail", () => {
    it("uses blue for BUY and escapes the client name", () => {
        const { subject, html } = newOrderEmail(order);
        expect(subject).toBe("New BUY order #42: 100 shares of National Stock Exchange by Asha <b>Rao</b>");
        expect(html).toContain("background:#1d4ed8;padding:18px 28px");
        expect(html).toContain("Asha &lt;b&gt;Rao&lt;/b&gt;");
        expect(html).not.toContain("<b>Rao</b>");
        expect(html).toContain("₹1,85,000.00");
        expect(html).toContain("Not provided");
        expect(html).toContain("2 other orders are also waiting");
    });

    it("uses red for SELL", () => {
        const { subject, html } = newOrderEmail({ ...order, type: TransactionType.SELL });
        expect(subject).toContain("New SELL order #42");
        expect(html).toContain(`background:#dc2626;padding:18px 28px`);
    });
});

describe("newRegistrationEmail", () => {
    it("masks the bank account and counts other waiting clients", () => {
        const { subject, html } = newRegistrationEmail({
            userId: 9,
            name: "Rohan Mehta",
            phoneNumber: "9123456780",
            email: "rohan@example.com",
            panNumber: "ABCDE1234F",
            dematClientId: null,
            dematDpId: null,
            bankName: "HDFC Bank",
            bankAccountNo: "123456789012",
            ifscCode: "HDFC0001234",
            registeredAt: new Date("2026-10-13T10:15:00Z"),
            pendingApprovals: 1,
            dashboardUrl: "http://localhost:3000/admin",
        });
        expect(subject).toBe("New registration: Rohan Mehta is waiting for approval");
        expect(html).toContain("XXXX 9012");
        expect(html).not.toContain("123456789012");
        expect(html).toContain("No other clients are waiting for approval.");
    });
});
