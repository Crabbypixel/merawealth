import { Injectable } from '@nestjs/common';
import { CompanyStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientService {
    constructor(private readonly prisma : PrismaService) {}

    async getCompanies() {
        const activeCompanies = await this.prisma.company.findMany({
            where: {
                isActive: CompanyStatus.ACTIVE
            },
            orderBy: {
                companyName: "asc"
            },
            select: {
                companyCode: true,
                companyName: true,
                companyLogo: true,
                companyUrl: true,
                shortNote: true,
                indicativePrice: true,
                minQty: true
            }
        });

        return {
            success: true,
            activeCompanies
        }
    }
}
