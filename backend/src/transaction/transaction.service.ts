import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyStatus, TransactionStatus } from '@prisma/client';
import { Request } from "express";
import { SessionService } from 'src/auth/session.service';
import { GetTransactionDto } from './dto/get-transactions.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class TransactionService {
    constructor(private readonly prisma: PrismaService,
        private readonly sessionService: SessionService,
        private readonly emailService: EmailService
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
            throw new InternalServerErrorException("Unable to send confirmation email.")
        });

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
                    priceAtOrder: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true,

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
            transactions,
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

        const validTransitions: Record<TransactionStatus, TransactionStatus[]> = {
            PENDING: [
                TransactionStatus.UNDER_PROCESS,
                TransactionStatus.REJECTED
            ],
            UNDER_PROCESS: [
                TransactionStatus.COMPLETED,
                TransactionStatus.REJECTED
            ],
            COMPLETED: [],
            REJECTED: [],
            CANCELLED: [],
            PARTIALLY_COMPLETED: []
        };

        if (!validTransitions[transaction.status].includes(dto.status)) {
            throw new BadRequestException({
                success: false,
                message: `Cannot change status from ${transaction.status} to ${dto.status}.`
            });
        }

        return this.prisma.transaction.update({
            where: { id },
            data: { status: dto.status }
        });
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

        await this.prisma.transaction.update({
            where: { id },
            data: { status: TransactionStatus.CANCELLED }
        });

        return {
            success: true,
            message: "Transaction cancelled successfully."
        };
    }
}
