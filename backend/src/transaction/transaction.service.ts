import { BadRequestException, Logger, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyStatus, TransactionStatus } from '@prisma/client';
import { Request } from "express";
import { SessionService } from 'src/auth/session.service';
import { GetTransactionDto } from './dto/get-transactions.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { EmailService } from 'src/email/email.service';
import { AdminAlertService } from 'src/email/admin-alert.service';

const MAX_ORDER_VALUE = 1_000_000_000_000;

@Injectable()
export class TransactionService {
    private readonly logger = new Logger(TransactionService.name);

    constructor(private readonly prisma: PrismaService,
        private readonly sessionService: SessionService,
        private readonly emailService: EmailService,
        private readonly adminAlert: AdminAlertService
    ) { }

    async createTransaction(req: Request, dto: CreateTransactionDto) {
        /* ----- AUTHORIZE CLIENT -----*/
        const sessionToken = req.cookies.session;

        if (!sessionToken) {
            throw new UnauthorizedException({
                success: false,
                message: "Not logged in."
            });
        }

        const session = await this.sessionService.findSession(sessionToken);

        if (!session) {
            throw new UnauthorizedException({
                success: false,
                message: "Invalid session."
            });
        }

        if (!session.userId) {
            throw new UnauthorizedException({
                success: false,
                message: "Invalid client session."
            });
        }

        if (!session.user) {
            throw new NotFoundException({
                success: false,
                message: "User not found in DB."
            });
        }

        /*----- VALIDATE TRANSACTION -----*/
        const company = await this.prisma.company.findUnique({ where: { companyCode: dto.companyCode } });

        if (!company) {
            throw new NotFoundException({
                success: false,
                message: "Company not found."
            });
        }

        if (company.isActive != CompanyStatus.ACTIVE) {
            throw new BadRequestException({
                success: false,
                message: "This company is currently unavailable for trading."
            });
        }

        if (dto.quantity < company.minQty) {
            throw new BadRequestException({
                success: false,
                message: `Minimum quantity is ${company.minQty}.`
            });
        }

        const priceAtOrder = company.indicativePrice;
        const totalAmount = priceAtOrder.mul(dto.quantity);

        // totalAmount is Decimal(14,2), so it must stay below ₹1,00,000 crore
        if (totalAmount.gte(MAX_ORDER_VALUE)) {
            throw new BadRequestException({
                success: false,
                message: "Order value is too large. Please reduce the quantity."
            });
        }

        const transaction = await this.prisma.transaction.create({
            data: {
                userId: session.userId,
                companyCode: company.companyCode,
                type: dto.type,
                quantity: dto.quantity,
                priceAtOrder,
                totalAmount
            }
        });

        const dueDate = new Date(transaction.createdAt);
        const dueTimeinDays = 1
        dueDate.setDate(dueDate.getDate() + dueTimeinDays);
        const formattedDueDate = String(dueDate.getDate()).padStart(2, "0") + "/" + String(dueDate.getMonth() + 1).padStart(2, "0") + "/" + dueDate.getFullYear();
        this.emailService.sendTransactionEmail(
            session.user.email,
            transaction.id,
            session.user?.name,
            company.companyName,
            dto.quantity,
            priceAtOrder.toString(),
            totalAmount.toString(),
            TransactionStatus.PENDING,
            dto.type,
            session.user.dematDpId,
            formattedDueDate
        ).catch((err) => {
            // Throwing here would crash the API: the order is already saved and the response sent
            this.logger.error(`Order confirmation email for order ${transaction.id} failed`, err);
        });

        // Tell the admins; runs in the background and never fails the order
        void this.adminAlert.newOrder(transaction.id);

        return {
            success: true,
            message: "Order placed successfully. Check your email for more details."
        };
    }

    async getTransactionsAdmin(query: GetTransactionDto) {
        // If query status exists, it will return transactions containing the corresponding order status
        // If no query status is provided, the where clause will have nothing, returning all transactions
        const where = {
            ...(query.status && { status: query.status }),
        };

        const skip = (query.page - 1) * query.limit;

        const [transactions, total] = await this.prisma.$transaction([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: query.limit,

                select: {
                    id: true,
                    type: true,
                    quantity: true,
                    approvedQuantity: true,
                    matchedQuantity: true,
                    pendingQuantity: true,
                    priceAtOrder: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true,

                    // Latest Order Match round for this order, shown as its matched date.
                    matches: {
                        select: { matchDate: true },
                        orderBy: { matchDate: "desc" },
                        take: 1,
                    },

                    user: {
                        select: {
                            id: true,
                            name: true,
                            phoneNumber: true,
                            email: true,
                        },
                    },

                    company: {
                        select: {
                            companyCode: true,
                            companyName: true,
                        },
                    },
                },

                orderBy: {
                    createdAt: "desc",
                },
            }),

            this.prisma.transaction.count({
                where,
            }),
        ]);

        return {
            transactions: transactions.map(({ matches, ...t }) => ({
                ...t,
                matchedAt: matches[0]?.matchDate ?? null,
            })),
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }

    async getTransactionsClient(req: Request, query: GetTransactionDto) {
        /* ----- AUTHORIZE CLIENT -----*/
        const sessionToken = req.cookies.session;

        if (!sessionToken) {
            throw new UnauthorizedException({
                success: false,
                message: "Not logged in."
            });
        }

        const session = await this.sessionService.findSession(sessionToken);

        if (!session) {
            throw new UnauthorizedException({
                success: false,
                message: "Invalid session."
            });
        }

        const where = {
            userId: session.userId!,
            ...(query.status && { status: query.status })
        };

        const skip = (query.page - 1) * query.limit;

        const [transactions, total] = await this.prisma.$transaction([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: query.limit,
                select: {
                    id: true,
                    type: true,
                    quantity: true,
                    approvedQuantity: true,
                    matchedQuantity: true,
                    pendingQuantity: true,
                    priceAtOrder: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true,

                    company: {
                        select: {
                            companyCode: true,
                            companyName: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc"
                }
            }),

            this.prisma.transaction.count({
                where
            })
        ]);

        return {
            success: true,
            transactions,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit)
            }
        };
    }

    async updateTransactionStatus(id: number, dto: UpdateTransactionStatusDto) {
        const transaction = await this.prisma.transaction.findUnique({ where: { id } });

        if (!transaction) {
            throw new NotFoundException("Transaction not found.");
        }

        // PARTIALLY_COMPLETED is only set by order matching, never by hand.
        const validTransitions: Record<TransactionStatus, TransactionStatus[]> = {
            PENDING: [
                TransactionStatus.UNDER_PROCESS,
                TransactionStatus.REJECTED
            ],
            UNDER_PROCESS: [
                TransactionStatus.COMPLETED,
                TransactionStatus.REJECTED
            ],
            PARTIALLY_COMPLETED: [
                TransactionStatus.COMPLETED,
                TransactionStatus.REJECTED
            ],
            COMPLETED: [],
            REJECTED: [],
            CANCELLED: []
        };

        if (!validTransitions[transaction.status].includes(dto.status)) {
            throw new BadRequestException({
                success: false,
                message: `Cannot change status from ${transaction.status} to ${dto.status}.`
            });
        }

        const isApproval = dto.status === TransactionStatus.UNDER_PROCESS;

        if (!isApproval && dto.approvedQuantity !== undefined) {
            throw new BadRequestException({
                success: false,
                message: "Approved quantity can only be set when approving an order."
            });
        }

        // Approving fixes the final quantity used for order matching.
        // Matched/pending quantities are left as they are for every other change,
        // so a reject keeps the shares already matched.
        let quantities = {};
        if (isApproval) {
            const approvedQuantity = dto.approvedQuantity;

            if (approvedQuantity === undefined || approvedQuantity < 1 || approvedQuantity > transaction.quantity) {
                throw new BadRequestException({
                    success: false,
                    message: `Approved quantity must be between 1 and ${transaction.quantity}.`
                });
            }

            // The approved quantity is the final quantity, so the order total follows it.
            quantities = {
                approvedQuantity,
                matchedQuantity: 0,
                pendingQuantity: approvedQuantity,
                totalAmount: transaction.priceAtOrder.mul(approvedQuantity)
            };
        }

        // Only update if nobody changed the status since we read it
        // (another admin tab, order matching or a client cancel).
        const result = await this.prisma.transaction.updateMany({
            where: { id, status: transaction.status },
            data: { status: dto.status, ...quantities }
        });

        if (result.count === 0) {
            throw new ConflictException({
                success: false,
                message: "This order was changed by someone else. Please refresh and try again."
            });
        }

        return this.prisma.transaction.findUnique({ where: { id } });
    }

    async cancelTranscationClient(id: number, req: Request) {
        /* ----- AUTHORIZE CLIENT -----*/
        const sessionToken = req.cookies.session;

        if (!sessionToken) {
            throw new UnauthorizedException({
                success: false,
                message: "Not logged in."
            });
        }

        const session = await this.sessionService.findSession(sessionToken);

        if (!session) {
            throw new UnauthorizedException({
                success: false,
                message: "Invalid session."
            });
        }

        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                userId: true
            }
        });

        if (!transaction) {
            throw new NotFoundException("Transaction not found.");
        }

        if (transaction.userId !== session.userId) {
            throw new ForbiddenException("You cannot cancel this transaction");
        }

        if (transaction.status !== TransactionStatus.PENDING) {
            throw new BadRequestException("Only pending transaction can be cancelled.");
        }

        // Only cancel if the admin has not approved or rejected it in the meantime.
        const result = await this.prisma.transaction.updateMany({
            where: { id, status: TransactionStatus.PENDING },
            data: { status: TransactionStatus.CANCELLED }
        });

        if (result.count === 0) {
            throw new BadRequestException("Only pending transaction can be cancelled.");
        }

        return {
            success: true,
            message: "Transaction cancelled successfully."
        };
    }
}
