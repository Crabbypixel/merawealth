import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import { CompanyStatus } from '@prisma/client';
import { GetCompanyDto } from './dto/get-company.dto';
import { GetCompaniesDto } from './dto/get-companies.dto';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class CompanyService {
    constructor(private readonly prisma: PrismaService) { }

    // Create a new entry in company master
    async createCompany(dto: CreateCompanyDto, logo: Express.Multer.File) {
        const [existingCode, existingCompany] = await Promise.all([
            this.prisma.company.findUnique({ where: { companyCode: dto.companyCode } }),
            this.prisma.company.findFirst({ where: { companyName: dto.companyName } })
        ]);

        // Both company code and company name must be unique in the table.
        if (existingCode) {
            throw new BadRequestException({
                success: false,
                message: "Company code already exists."
            });
        }

        if (existingCompany) {
            throw new BadRequestException({
                success: false,
                message: "Company name already exists."
            });
        }

        await this.prisma.company.create({
            data: {
                companyCode: dto.companyCode,
                companyName: dto.companyName,
                companyLogo: logo.filename,
                companyUrl: dto.companyUrl,
                shortNote: dto.shortNote,
                indicativePrice: dto.indicativePrice,
                minQty: dto.minQty
            }
        });

        return {
            success: true,
            message: "Company created successfully.",
        };
    }

    async updateCompany(companyCode: string, dto: UpdateCompanyDto, logo: Express.Multer.File) {
        const company = await this.prisma.company.findUnique({ where: { companyCode } });

        // If company to be updated not found
        if (!company) {
            throw new NotFoundException({
                success: false,
                message: "Company not found."
            });
        }

        // Prevent duplicate names
        if (dto.companyName) {
            const existing = await this.prisma.company.findFirst({
                where: {
                    companyName: dto.companyName,
                    NOT: {      // This allows company to keep its current name (we don't want to query the same original row)
                        companyCode: companyCode
                    }
                }
            });

            if (existing) {
                throw new BadRequestException({
                    success: false,
                    message: "Company name already exists."
                });
            }
        }

        // Prepare update data
        const updateData: UpdateCompanyDto = {
            ...dto
        };

        // If new logo was uploaded
        if(logo)
        {
            // Delete the previous logo
            if(company.companyLogo) {
                const oldLogoPath = join(process.cwd(), "uploads", "company-logos", company.companyLogo);

                if(existsSync(oldLogoPath)) {
                    try {
                        unlinkSync(oldLogoPath);
                    } catch(err) {
                        console.error("Failed to delete old path.");
                    }
                }
            }

            updateData.companyLogo = logo.filename;
        }

        // Update
        await this.prisma.company.update({
            where: { companyCode },
            data: updateData
        });

        return {
            success: true,
            message: "Company updated successfully."
        };
    }

    async getCompaniesAdmin(query: GetCompanyDto) {
        const skip = (query.page - 1) * query.limit;

        const [companies, total] = await this.prisma.$transaction([
            this.prisma.company.findMany({
                skip,
                take: query.limit,
                orderBy: {
                    createdAt: "desc",
                },
            }),

            this.prisma.company.count(),
        ]);

        return {
            success: true,
            companies,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }

    async updateCompanyStatus(companyCode: string, dto: UpdateCompanyStatusDto) {
        const company = await this.prisma.company.findUnique({ where: { companyCode } });

        if (!company) {
            throw new NotFoundException({
                success: false,
                message: "Company not found."
            });
        }

        await this.prisma.company.update({
            where: {
                companyCode
            },
            data: {
                isActive: dto.status
            }
        });

        return {
            success: true,
            message: `Company marked as ${dto.status}.`
        };
    }

    async getCompaniesClient(query: GetCompanyDto) {
        const skip = (query.page - 1) * query.limit;

        const where = {
            isActive: CompanyStatus.ACTIVE
        }

        const [companies, total] = await this.prisma.$transaction([
            this.prisma.company.findMany({
                where,
                skip,
                take: query.limit,
                orderBy: {
                    companyName: "asc",
                },
                select: {
                    companyCode: true,
                    companyName: true,
                    companyLogo: true,
                    companyUrl: true,
                    shortNote: true,
                    indicativePrice: true,
                    minQty: true,
                },
            }),

            this.prisma.company.count({
                where,
            }),
        ]);

        return {
            success: true,
            companies,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };
    }

    async getCompany(companyCode: string) {
        const company = await this.prisma.company.findUnique({
            where: {
                companyCode
            },
            select: {
                companyCode: true,
                companyName: true,
                companyLogo: true,
                companyUrl: true,
                shortNote: true,
                indicativePrice: true,
                minQty: true,
                isActive: true,
            }
        });

        if(!company) {
            throw new NotFoundException({
                success: false,
                message: "Company not found."
            });
        }

        return {
            success: true,
            company
        };
    }

    async getCompaniesPublic(dto: GetCompaniesDto) {
        const { page, limit } = dto;

        const where = {
            isActive: CompanyStatus.ACTIVE,
        };

        const [companies, total] = await this.prisma.$transaction([
            this.prisma.company.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    companyName: "asc",
                },
                select: {
                    companyCode: true,
                    companyName: true,
                    companyLogo: true,
                    companyUrl: true,
                    shortNote: true,
                    indicativePrice: true,
                    minQty: true,
                },
            }),

            this.prisma.company.count({
                where,
            }),
        ]);

        return {
            success: true,
            companies,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

}
