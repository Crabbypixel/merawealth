import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyStatus } from '@prisma/client';
import { Request } from "express";
import { SessionService } from 'src/auth/session.service';

@Injectable()
export class TransactionService {
    constructor(private readonly prisma : PrismaService,
        private readonly sessionService : SessionService
    ) {}

    async createTransaction(req: Request, dto : CreateTransactionDto) {
        /* ----- AUTHORIZE CLIENT -----*/
        const sessionToken = req.cookies.session;

        if(!sessionToken) {
            throw new UnauthorizedException({
                success: false,
                message: "Not logged in."
            });
        }

        const session = await this.sessionService.findSession(sessionToken);

        if(!session) {
            throw new UnauthorizedException({
                success: false,
                message: "Invalid session."
            });
        }

        /*----- VALIDATE TRANSACTION -----*/
        const company = await this.prisma.company.findUnique({ where: { companyCode: dto.companyCode } });

        if(!company) {
            throw new NotFoundException({
                success: false,
                message: "Company not found."
            });
        }

        if(company.isActive != CompanyStatus.ACTIVE) {
            throw new BadRequestException({
                success: false,
                message: "This company is currently unavailable for trading."
            });
        }

        if(dto.quantity < company.minQty) {
            throw new BadRequestException({
                success: false,
                message: `Minimum quantity is ${company.minQty}.`
            });
        }
        
        const priceAtOrder = company.indicativePrice;
        const totalAmount = priceAtOrder.mul(dto.quantity);

        await this.prisma.transaction.create({
            data: {
                userId: session.userId ?? 0,
                companyCode: company.companyCode,
                type: dto.type,
                quantity: dto.quantity,
                priceAtOrder,
                totalAmount
            }
        });

        return {
            success: true,
            message: "Transcation created successfully."
        };
    }
}
