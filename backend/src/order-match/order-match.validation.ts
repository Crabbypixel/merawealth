import { TransactionStatus, TransactionType } from "@prisma/client";

/*
 * Rules for a manual order match, kept free of the database so they can be unit tested.
 * The admin screen runs the same checks when "Save" is clicked; the server runs them
 * again on "Confirm" and is the one that decides.
 */

export const MATCH_ID_MAX_LENGTH = 20;

// An order that is open for matching in one company.
export interface MatchableOrder {
    id: number;
    userId: number;
    type: TransactionType;
    matchedQuantity: number;
    pendingQuantity: number;
}

// One row the admin filled in on the matching screen.
export interface MatchEntryInput {
    transactionId: number;
    matchQuantity: number;
    matchId: string;
}

export interface MatchError {
    transactionId?: number;
    matchId?: string;
    message: string;
}

export interface OrderUpdate {
    transactionId: number;
    matchedQuantity: number;
    pendingQuantity: number;
    status: TransactionStatus;
}

export interface MatchValidationResult {
    errors: MatchError[];
    // Entries with the Match ID trimmed and upper-cased (only meaningful when errors is empty).
    entries: MatchEntryInput[];
    // New quantities and status for every order in the entries.
    updates: OrderUpdate[];
}

// "m1 " and "M1" are the same Match ID.
export function normalizeMatchId(matchId: string): string {
    return matchId.trim().toUpperCase();
}

export function validateMatchEntries(
    orders: MatchableOrder[],
    rawEntries: MatchEntryInput[],
    usedMatchIds: Iterable<string>
): MatchValidationResult {
    const errors: MatchError[] = [];
    const ordersById = new Map(orders.map((o) => [o.id, o]));
    const alreadyUsed = new Set(Array.from(usedMatchIds, normalizeMatchId));

    const entries = rawEntries.map((e) => ({ ...e, matchId: normalizeMatchId(e.matchId) }));

    if (entries.length === 0) {
        errors.push({ message: "Enter a match quantity and Match ID for at least one buy and one sell order." });
    }

    // Per-order checks
    const seen = new Set<number>();
    for (const entry of entries) {
        const order = ordersById.get(entry.transactionId);

        if (!order) {
            errors.push({
                transactionId: entry.transactionId,
                message: `Order #${entry.transactionId} is not open for matching in this company.`
            });
            continue;
        }

        if (seen.has(entry.transactionId)) {
            errors.push({
                transactionId: entry.transactionId,
                message: `Order #${entry.transactionId} appears more than once.`
            });
            continue;
        }
        seen.add(entry.transactionId);

        if (!Number.isInteger(entry.matchQuantity) || entry.matchQuantity < 1) {
            errors.push({
                transactionId: entry.transactionId,
                message: `Order #${entry.transactionId}: match quantity must be a whole number of at least 1.`
            });
        } else if (entry.matchQuantity > order.pendingQuantity) {
            errors.push({
                transactionId: entry.transactionId,
                message: `Order #${entry.transactionId}: match quantity ${entry.matchQuantity} is more than its pending quantity ${order.pendingQuantity}.`
            });
        }

        if (entry.matchId === "") {
            errors.push({
                transactionId: entry.transactionId,
                message: `Order #${entry.transactionId}: Match ID is required.`
            });
        } else if (entry.matchId.length > MATCH_ID_MAX_LENGTH) {
            errors.push({
                transactionId: entry.transactionId,
                matchId: entry.matchId,
                message: `Order #${entry.transactionId}: Match ID can be at most ${MATCH_ID_MAX_LENGTH} characters.`
            });
        }
    }

    // Per-Match ID checks
    const groups = new Map<string, MatchEntryInput[]>();
    for (const entry of entries) {
        if (entry.matchId === "" || !ordersById.has(entry.transactionId)) continue;
        const group = groups.get(entry.matchId) ?? [];
        group.push(entry);
        groups.set(entry.matchId, group);
    }

    for (const [matchId, group] of groups) {
        if (alreadyUsed.has(matchId)) {
            errors.push({
                matchId,
                message: `Match ID ${matchId} was already used for this company. Please use a new one.`
            });
        }

        const sells = group.filter((e) => ordersById.get(e.transactionId)!.type === TransactionType.SELL);
        const buys = group.filter((e) => ordersById.get(e.transactionId)!.type === TransactionType.BUY);

        if (sells.length === 0 || buys.length === 0) {
            errors.push({
                matchId,
                message: `Match ID ${matchId} needs at least one seller and one buyer.`
            });
            continue;
        }

        const sellTotal = sells.reduce((sum, e) => sum + e.matchQuantity, 0);
        const buyTotal = buys.reduce((sum, e) => sum + e.matchQuantity, 0);
        if (sellTotal !== buyTotal) {
            errors.push({
                matchId,
                message: `Match ID ${matchId}: sellers total ${sellTotal} but buyers total ${buyTotal}. They must be equal.`
            });
        }

        const sellerIds = new Set(sells.map((e) => ordersById.get(e.transactionId)!.userId));
        const sameClient = buys.some((e) => sellerIds.has(ordersById.get(e.transactionId)!.userId));
        if (sameClient) {
            errors.push({
                matchId,
                message: `Match ID ${matchId}: the same client cannot be both a seller and a buyer.`
            });
        }
    }

    if (errors.length > 0) {
        return { errors, entries, updates: [] };
    }

    const updates = entries.map((entry) => {
        const order = ordersById.get(entry.transactionId)!;
        const pendingQuantity = order.pendingQuantity - entry.matchQuantity;
        return {
            transactionId: order.id,
            matchedQuantity: order.matchedQuantity + entry.matchQuantity,
            pendingQuantity,
            status: pendingQuantity === 0 ? TransactionStatus.COMPLETED : TransactionStatus.PARTIALLY_COMPLETED
        };
    });

    return { errors, entries, updates };
}
