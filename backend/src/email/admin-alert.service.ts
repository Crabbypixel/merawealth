import { Injectable, Logger } from "@nestjs/common";
import { TransactionStatus, TransactionType, UserStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { EmailService } from "./email.service";
import { newOrderEmail, newRegistrationEmail, OpenSide } from "./admin-alert.templates";

// Emails every admin (the Admin table) when a client registers or places an order.
// Both methods never throw: a failed alert is logged and must not affect the client's request.
@Injectable()
export class AdminAlertService {
    private readonly logger = new Logger(AdminAlertService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) { }

    async newRegistration(userId: number): Promise<void> {
        try {
            const [user, pendingApprovals, adminEmails] = await Promise.all([
                this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
                this.prisma.user.count({ where: { status: UserStatus.PENDING } }),
                this.adminEmails(),
            ]);
            if (adminEmails.length === 0) return;

            const { subject, html } = newRegistrationEmail({
                userId: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                email: user.email,
                panNumber: user.panNumber,
                dematClientId: user.dematClientId,
                dematDpId: user.dematDpId,
                bankName: user.bankName,
                bankAccountNo: user.bankAccountNo,
                ifscCode: user.ifscCode,
                registeredAt: user.createdAt,
                pendingApprovals,
                dashboardUrl: this.dashboardUrl(),
            });
            await this.emailService.sendToAdmins(adminEmails, subject, html);
        } catch (err) {
            this.logger.error(`New registration email for user ${userId} failed`, err as Error);
        }
    }

    async newOrder(transactionId: number): Promise<void> {
        try {
            const order = await this.prisma.transaction.findUniqueOrThrow({
                where: { id: transactionId },
                include: { user: true, company: true },
            });

            const [previousOrders, openOrders, ordersToVerify, adminEmails] = await Promise.all([
                this.prisma.transaction.count({
                    where: { userId: order.userId, id: { lt: order.id } },
                }),
                this.prisma.transaction.findMany({
                    where: {
                        companyCode: order.companyCode,
                        status: {
                            in: [
                                TransactionStatus.PENDING,
                                TransactionStatus.UNDER_PROCESS,
                                TransactionStatus.PARTIALLY_COMPLETED,
                            ],
                        },
                    },
                    select: { type: true, status: true, quantity: true, pendingQuantity: true },
                }),
                this.prisma.transaction.count({ where: { status: TransactionStatus.PENDING } }),
                this.adminEmails(),
            ]);
            if (adminEmails.length === 0) return;

            const openBuy: OpenSide = { orders: 0, shares: 0 };
            const openSell: OpenSide = { orders: 0, shares: 0 };
            for (const o of openOrders) {
                const shares = o.status === TransactionStatus.PENDING ? o.quantity : o.pendingQuantity;
                if (shares <= 0) continue;
                const side = o.type === TransactionType.BUY ? openBuy : openSell;
                side.orders += 1;
                side.shares += shares;
            }

            const { subject, html } = newOrderEmail({
                orderId: order.id,
                type: order.type,
                placedAt: order.createdAt,
                companyName: order.company.companyName,
                companyCode: order.companyCode,
                quantity: order.quantity,
                price: order.priceAtOrder.toString(),
                totalAmount: order.totalAmount.toString(),
                client: {
                    id: order.user.id,
                    name: order.user.name,
                    phoneNumber: order.user.phoneNumber,
                    email: order.user.email,
                    dematClientId: order.user.dematClientId,
                    dematDpId: order.user.dematDpId,
                    clientSince: order.user.createdAt,
                    previousOrders,
                },
                openBuy,
                openSell,
                ordersToVerify,
                dashboardUrl: this.dashboardUrl(),
            });
            await this.emailService.sendToAdmins(adminEmails, subject, html);
        } catch (err) {
            this.logger.error(`New order email for order ${transactionId} failed`, err as Error);
        }
    }

    private async adminEmails(): Promise<string[]> {
        const admins = await this.prisma.admin.findMany({ select: { email: true } });
        return admins.map((a) => a.email);
    }

    private dashboardUrl(): string {
        const frontend = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/+$/, "");
        return `${frontend}/admin`;
    }
}
