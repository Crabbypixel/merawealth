// Checks for the manual order matching screen, run when the admin clicks "Save".
// They mirror backend/src/order-match/order-match.validation.ts; the server runs
// its own copy again on "Confirm" and has the final say.

export const MATCH_ID_MAX_LENGTH = 20;

export interface MatchOrderRow {
    id: number;
    userId: number;
    type: "BUY" | "SELL";
    status: string;
    clientName: string;
    quantity: number;
    approvedQuantity: number;
    matchedQuantity: number;
    pendingQuantity: number;
    priceAtOrder: string;
    createdAt: string;
    updatedAt: string;
}

// What the admin typed against one order (both blank = not part of this match).
export interface MatchInput {
    matchQuantity: string;
    matchId: string;
}

export interface MatchProblem {
    transactionId?: number;
    matchId?: string;
    message: string;
}

export interface MatchGroupSummary {
    matchId: string;
    sellTotal: number;
    buyTotal: number;
}

export interface MatchCheckResult {
    problems: MatchProblem[];
    entries: { transactionId: number; matchQuantity: number; matchId: string; updatedAt: string }[];
    groups: MatchGroupSummary[];
}

export function normalizeMatchId(matchId: string): string {
    return matchId.trim().toUpperCase();
}

export function checkMatches(
    orders: MatchOrderRow[],
    inputs: Record<number, MatchInput>,
    usedMatchIds: string[]
): MatchCheckResult {
    const problems: MatchProblem[] = [];
    const used = new Set(usedMatchIds.map(normalizeMatchId));
    const entries: MatchCheckResult["entries"] = [];

    for (const order of orders) {
        const input = inputs[order.id];
        const qtyText = input?.matchQuantity.trim() ?? "";
        const matchId = normalizeMatchId(input?.matchId ?? "");

        if (qtyText === "" && matchId === "") continue;

        const qty = Number(qtyText);

        if (qtyText === "") {
            problems.push({ transactionId: order.id, message: `Order #${order.id}: enter a match quantity.` });
        } else if (!Number.isInteger(qty) || qty < 1) {
            problems.push({ transactionId: order.id, message: `Order #${order.id}: match quantity must be a whole number of at least 1.` });
        } else if (qty > order.pendingQuantity) {
            problems.push({ transactionId: order.id, message: `Order #${order.id}: match quantity ${qty} is more than its pending quantity ${order.pendingQuantity}.` });
        }

        if (matchId === "") {
            problems.push({ transactionId: order.id, message: `Order #${order.id}: Match ID is required.` });
        } else if (matchId.length > MATCH_ID_MAX_LENGTH) {
            problems.push({ transactionId: order.id, message: `Order #${order.id}: Match ID can be at most ${MATCH_ID_MAX_LENGTH} characters.` });
        }

        entries.push({
            transactionId: order.id,
            matchQuantity: qtyText === "" ? 0 : qty,
            matchId,
            updatedAt: order.updatedAt
        });
    }

    const ordersById = new Map(orders.map((o) => [o.id, o]));
    const byMatchId = new Map<string, typeof entries>();
    for (const entry of entries) {
        if (entry.matchId === "") continue;
        byMatchId.set(entry.matchId, [...(byMatchId.get(entry.matchId) ?? []), entry]);
    }

    const groups: MatchGroupSummary[] = [];
    for (const [matchId, group] of byMatchId) {
        const sells = group.filter((e) => ordersById.get(e.transactionId)!.type === "SELL");
        const buys = group.filter((e) => ordersById.get(e.transactionId)!.type === "BUY");
        const sellTotal = sells.reduce((sum, e) => sum + (Number.isFinite(e.matchQuantity) ? e.matchQuantity : 0), 0);
        const buyTotal = buys.reduce((sum, e) => sum + (Number.isFinite(e.matchQuantity) ? e.matchQuantity : 0), 0);
        groups.push({ matchId, sellTotal, buyTotal });

        if (used.has(matchId)) {
            problems.push({ matchId, message: `Match ID ${matchId} was already used for this company. Please use a new one.` });
        }

        if (sells.length === 0 || buys.length === 0) {
            problems.push({ matchId, message: `Match ID ${matchId} needs at least one seller and one buyer.` });
            continue;
        }

        if (sellTotal !== buyTotal) {
            problems.push({ matchId, message: `Match ID ${matchId}: sellers total ${sellTotal} but buyers total ${buyTotal}. They must be equal.` });
        }

        const sellerIds = new Set(sells.map((e) => ordersById.get(e.transactionId)!.userId));
        if (buys.some((e) => sellerIds.has(ordersById.get(e.transactionId)!.userId))) {
            problems.push({ matchId, message: `Match ID ${matchId}: the same client cannot be both a seller and a buyer.` });
        }
    }

    if (entries.length === 0) {
        problems.push({ message: "Enter a match quantity and Match ID for at least one buy and one sell order." });
    }

    return { problems, entries, groups };
}
