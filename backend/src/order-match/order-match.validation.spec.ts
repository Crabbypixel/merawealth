import { TransactionStatus, TransactionType } from "@prisma/client";
import { MatchableOrder, normalizeMatchId, validateMatchEntries } from "./order-match.validation";

const sell = (id: number, userId: number, pending: number, matched = 0): MatchableOrder => ({
    id, userId, type: TransactionType.SELL, pendingQuantity: pending, matchedQuantity: matched
});
const buy = (id: number, userId: number, pending: number, matched = 0): MatchableOrder => ({
    id, userId, type: TransactionType.BUY, pendingQuantity: pending, matchedQuantity: matched
});

describe("validateMatchEntries", () => {
    // S1 approved 20; B1 and B2 approved 10 each (the example from the plan)
    const orders = [sell(103, 1, 20), buy(101, 2, 10), buy(102, 3, 10)];

    it("accepts one seller matched with two buyers under the same Match ID", () => {
        const result = validateMatchEntries(orders, [
            { transactionId: 103, matchQuantity: 20, matchId: "M1" },
            { transactionId: 101, matchQuantity: 10, matchId: "M1" },
            { transactionId: 102, matchQuantity: 10, matchId: "M1" }
        ], []);

        expect(result.errors).toEqual([]);
        expect(result.updates).toEqual([
            { transactionId: 103, matchedQuantity: 20, pendingQuantity: 0, status: TransactionStatus.COMPLETED },
            { transactionId: 101, matchedQuantity: 10, pendingQuantity: 0, status: TransactionStatus.COMPLETED },
            { transactionId: 102, matchedQuantity: 10, pendingQuantity: 0, status: TransactionStatus.COMPLETED }
        ]);
    });

    it("marks partly matched orders PARTIALLY_COMPLETED and adds to what was matched before", () => {
        const result = validateMatchEntries([sell(1, 1, 15, 5), buy(2, 2, 10)], [
            { transactionId: 1, matchQuantity: 10, matchId: "M2" },
            { transactionId: 2, matchQuantity: 10, matchId: "M2" }
        ], []);

        expect(result.errors).toEqual([]);
        expect(result.updates).toEqual([
            { transactionId: 1, matchedQuantity: 15, pendingQuantity: 5, status: TransactionStatus.PARTIALLY_COMPLETED },
            { transactionId: 2, matchedQuantity: 10, pendingQuantity: 0, status: TransactionStatus.COMPLETED }
        ]);
    });

    it("allows several Match IDs in one confirm", () => {
        const result = validateMatchEntries(
            [sell(1, 1, 5), buy(2, 2, 5), sell(3, 3, 7), buy(4, 4, 7)],
            [
                { transactionId: 1, matchQuantity: 5, matchId: "A" },
                { transactionId: 2, matchQuantity: 5, matchId: "A" },
                { transactionId: 3, matchQuantity: 7, matchId: "B" },
                { transactionId: 4, matchQuantity: 7, matchId: "B" }
            ],
            []
        );
        expect(result.errors).toEqual([]);
        expect(result.updates).toHaveLength(4);
    });

    it("treats Match IDs case-insensitively and ignores spaces", () => {
        const result = validateMatchEntries(orders, [
            { transactionId: 103, matchQuantity: 10, matchId: " m1 " },
            { transactionId: 101, matchQuantity: 10, matchId: "M1" }
        ], []);

        expect(result.errors).toEqual([]);
        expect(result.entries.map((e) => e.matchId)).toEqual(["M1", "M1"]);
    });

    it("refuses when sell and buy totals differ", () => {
        const result = validateMatchEntries(orders, [
            { transactionId: 103, matchQuantity: 20, matchId: "M1" },
            { transactionId: 101, matchQuantity: 10, matchId: "M1" }
        ], []);

        expect(result.errors).toEqual([
            { matchId: "M1", message: "Match ID M1: sellers total 20 but buyers total 10. They must be equal." }
        ]);
        expect(result.updates).toEqual([]);
    });

    it("refuses a Match ID with only sellers or only buyers", () => {
        const result = validateMatchEntries(orders, [
            { transactionId: 101, matchQuantity: 10, matchId: "M1" },
            { transactionId: 102, matchQuantity: 10, matchId: "M1" }
        ], []);

        expect(result.errors.map((e) => e.message)).toEqual(["Match ID M1 needs at least one seller and one buyer."]);
    });

    it("refuses a match quantity above the order's pending quantity", () => {
        const result = validateMatchEntries(orders, [
            { transactionId: 103, matchQuantity: 11, matchId: "M1" },
            { transactionId: 101, matchQuantity: 11, matchId: "M1" }
        ], []);

        expect(result.errors).toEqual([
            { transactionId: 101, message: "Order #101: match quantity 11 is more than its pending quantity 10." }
        ]);
    });

    it("refuses the same client on both sides of a Match ID", () => {
        const result = validateMatchEntries([sell(1, 7, 5), buy(2, 7, 5)], [
            { transactionId: 1, matchQuantity: 5, matchId: "M1" },
            { transactionId: 2, matchQuantity: 5, matchId: "M1" }
        ], []);

        expect(result.errors.map((e) => e.message)).toEqual([
            "Match ID M1: the same client cannot be both a seller and a buyer."
        ]);
    });

    it("refuses a Match ID already used for this company", () => {
        const result = validateMatchEntries(orders, [
            { transactionId: 103, matchQuantity: 10, matchId: "M1" },
            { transactionId: 101, matchQuantity: 10, matchId: "M1" }
        ], ["m1"]);

        expect(result.errors.map((e) => e.message)).toEqual([
            "Match ID M1 was already used for this company. Please use a new one."
        ]);
    });

    it("refuses a missing or too long Match ID", () => {
        const result = validateMatchEntries(orders, [
            { transactionId: 103, matchQuantity: 10, matchId: "  " },
            { transactionId: 101, matchQuantity: 10, matchId: "X".repeat(21) }
        ], []);

        expect(result.errors.map((e) => e.message)).toEqual([
            "Order #103: Match ID is required.",
            "Order #101: Match ID can be at most 20 characters.",
            `Match ID ${"X".repeat(21)} needs at least one seller and one buyer.`
        ]);
    });

    it("refuses orders that are not open for matching, and duplicates", () => {
        const result = validateMatchEntries(orders, [
            { transactionId: 999, matchQuantity: 1, matchId: "M1" },
            { transactionId: 103, matchQuantity: 10, matchId: "M1" },
            { transactionId: 103, matchQuantity: 10, matchId: "M1" },
            { transactionId: 101, matchQuantity: 10, matchId: "M1" }
        ], []);

        expect(result.errors.map((e) => e.message)).toEqual([
            "Order #999 is not open for matching in this company.",
            "Order #103 appears more than once.",
            "Match ID M1: sellers total 20 but buyers total 10. They must be equal."
        ]);
    });

    it("refuses an empty confirm", () => {
        const result = validateMatchEntries(orders, [], []);
        expect(result.errors).toHaveLength(1);
    });

    it("refuses a match quantity below 1", () => {
        const result = validateMatchEntries(orders, [
            { transactionId: 103, matchQuantity: 0, matchId: "M1" },
            { transactionId: 101, matchQuantity: 0, matchId: "M1" }
        ], []);
        expect(result.errors.map((e) => e.transactionId)).toEqual([103, 101]);
    });
});

describe("normalizeMatchId", () => {
    it("trims and upper-cases", () => {
        expect(normalizeMatchId("  ab-1 ")).toBe("AB-1");
    });
});
