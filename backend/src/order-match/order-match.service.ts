import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Prisma, TransactionStatus, TransactionType } from "@prisma/client";
import { Request } from "express";
import { SessionService } from "src/auth/session.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfirmOrderMatchDto } from "./dto/confirm-order-match.dto";
import { validateMatchEntries } from "./order-match.validation";

// Orders the admin has approved and that still have shares left to match.
const MATCHABLE_STATUSES: TransactionStatus[] = [
    TransactionStatus.UNDER_PROCESS,
    TransactionStatus.PARTIALLY_COMPLETED
];

const matchableWhere = (companyCode?: string): Prisma.TransactionWhereInput => ({
    ...(companyCode && { companyCode }),
    status: { in: MATCHABLE_STATUSES },
    pendingQuantity: { gt: 0 }
});

@Injectable()
export class OrderMatchService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly sessionService: SessionService
    ) { }

    // Companies with at least one buy and one sell order waiting to be matched (for the pop-up).
    async getCompanies() {
        const groups = await this.prisma.transaction.groupBy({
            by: ["companyCode", "type"],
            where: matchableWhere(),
            _count: { _all: true },
            _sum: { pendingQuantity: true }
        });

        const byCompany = new Map<string, { sellOrders: number; buyOrders: number; sellPending: number; buyPending: number }>();
        for (const g of groups) {
            const entry = byCompany.get(g.companyCode) ?? { sellOrders: 0, buyOrders: 0, sellPending: 0, buyPending: 0 };
            if (g.type === TransactionType.SELL) {
                entry.sellOrders = g._count._all;
                entry.sellPending = g._sum.pendingQuantity ?? 0;
            } else {
                entry.buyOrders = g._count._all;
                entry.buyPending = g._sum.pendingQuantity ?? 0;
            }
            byCompany.set(g.companyCode, entry);
        }

        const codes = [...byCompany].filter(([, e]) => e.sellOrders > 0 && e.buyOrders > 0).map(([code]) => code);

        const companies = await this.prisma.company.findMany({
            where: { companyCode: { in: codes } },
            select: { companyCode: true, companyName: true },
            orderBy: { companyName: "asc" }
        });

        return {
            success: true,
            companies: companies.map((c) => ({ ...c, ...byCompany.get(c.companyCode)! }))
        };
    }

    // Sellers and buyers of one company for the matching screen.
    async getCompanyOrders(companyCode: string) {
        const company = await this.prisma.company.findUnique({
            where: { companyCode },
            select: { companyCode: true, companyName: true }
        });

        if (!company) {
            throw new NotFoundException({ success: false, message: "Company not found." });
        }

        const [orders, used] = await this.prisma.$transaction([
            this.prisma.transaction.findMany({
                where: matchableWhere(companyCode),
                select: {
                    id: true,
                    userId: true,
                    type: true,
                    status: true,
                    quantity: true,
                    approvedQuantity: true,
                    matchedQuantity: true,
                    pendingQuantity: true,
                    priceAtOrder: true,
                    createdAt: true,
                    updatedAt: true,
                    user: { select: { name: true } }
                },
                orderBy: [{ createdAt: "asc" }, { id: "asc" }]
            }),
            this.prisma.transactionMatch.findMany({
                where: { companyCode },
                distinct: ["matchId"],
                select: { matchId: true }
            })
        ]);

        const rows = orders.map(({ user, ...o }) => ({ ...o, clientName: user.name }));

        return {
            success: true,
            company,
            sellers: rows.filter((o) => o.type === TransactionType.SELL),
            buyers: rows.filter((o) => o.type === TransactionType.BUY),
            usedMatchIds: used.map((m) => m.matchId)
        };
    }

    // Store the admin's matches for one company. All or nothing.
    async confirm(req: Request, companyCode: string, dto: ConfirmOrderMatchDto) {
        const session = await this.sessionService.findSession(req.cookies.session as string);

        if (!session?.adminId) {
            throw new UnauthorizedException({ success: false, message: "Invalid admin session." });
        }
        const adminId = session.adminId;

        const company = await this.prisma.company.findUnique({ where: { companyCode }, select: { companyCode: true } });

        if (!company) {
            throw new NotFoundException({ success: false, message: "Company not found." });
        }

        const ids = [...new Set(dto.entries.map((e) => e.transactionId))];

        return this.prisma.$transaction(async (tx) => {
            // One confirm per company at a time, so two admins can't use the same new Match ID.
            await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${"order-match:" + companyCode}))`;

            // Lock the orders being matched until we commit, so a status change
            // (reject in another tab, client cancel) waits for us.
            await tx.$queryRaw`SELECT id FROM "Transaction" WHERE id IN (${Prisma.join(ids)}) FOR UPDATE`;

            const orders = await tx.transaction.findMany({
                where: matchableWhere(companyCode),
                select: {
                    id: true,
                    userId: true,
                    type: true,
                    matchedQuantity: true,
                    pendingQuantity: true,
                    updatedAt: true
                }
            });
            const ordersById = new Map(orders.map((o) => [o.id, o]));

            // Refuse if any order changed since the screen loaded it.
            const changed = dto.entries.some((e) => {
                const order = ordersById.get(e.transactionId);
                return !order || order.updatedAt.getTime() !== new Date(e.updatedAt).getTime();
            });

            if (changed) {
                throw new ConflictException({
                    success: false,
                    message: "Some of these orders changed since you opened this screen. Please reload and try again."
                });
            }

            const used = await tx.transactionMatch.findMany({
                where: { companyCode },
                distinct: ["matchId"],
                select: { matchId: true }
            });

            const { errors, entries, updates } = validateMatchEntries(
                orders,
                dto.entries,
                used.map((m) => m.matchId)
            );

            if (errors.length > 0) {
                throw new BadRequestException({
                    success: false,
                    message: "Please fix the highlighted problems before confirming.",
                    errors
                });
            }

            const matchDate = new Date();

            await tx.transactionMatch.createMany({
                data: entries.map((e) => ({
                    matchId: e.matchId,
                    companyCode,
                    transactionId: e.transactionId,
                    quantity: e.matchQuantity,
                    matchedByAdminId: adminId,
                    matchDate
                }))
            });

            for (const u of updates) {
                await tx.transaction.update({
                    where: { id: u.transactionId },
                    data: {
                        matchedQuantity: u.matchedQuantity,
                        pendingQuantity: u.pendingQuantity,
                        status: u.status
                    }
                });
            }

            return {
                success: true,
                message: "Order matching saved.",
                matchIds: [...new Set(entries.map((e) => e.matchId))],
                ordersCompleted: updates.filter((u) => u.status === TransactionStatus.COMPLETED).length,
                ordersPartiallyCompleted: updates.filter((u) => u.status === TransactionStatus.PARTIALLY_COMPLETED).length
            };
        }, { timeout: 20000 });
    }
}
