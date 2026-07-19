import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

    async getUsers(dto: GetUsersDto) {
        const page = dto.page;
        const limit = dto.limit;

        const where = dto.status ? { status: dto.status } : {};

        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    status: true,
                }
            }),

            this.prisma.user.count({ where })
        ]);

        return {
            success: true,
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    async updateUserStatus(id: number, dto: UpdateUserStatusDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException({
                success: false,
                message: "User not found."
            });
        }

        // Update status
        await this.prisma.user.update({ where: { id }, data: { status: dto.status } });

        return {
            success: true,
            message: "User status updated."
        };
    }

    async getUserDetails(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,

                name: true,
                email: true,
                phoneNumber: true,

                panNumber: true,
                dematClientId: true,
                dematDpId: true,

                bankAccountNo: true,
                ifscCode: true,
                bankName: true,

                status: true,
            },
        });

        if (!user) {
            throw new NotFoundException({
                success: false,
                message: "User not found."
            });
        }

        return {
            success: true,
            user
        };
    }

    async updateUser(id: number, dto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException({
                success: false,
                message: "User not found."
            });
        }

        await this.prisma.user.update({
            where: { id },
            data: {
                name: dto.name,
                email: dto.email,
                phoneNumber: dto.phoneNumber,

                panNumber: dto.panNumber.toUpperCase(),
                dematClientId: dto.dematClientId.toUpperCase(),
                dematDpId: dto.dematDpId.toUpperCase(),

                bankAccountNo: dto.bankAccountNo,

                ifscCode: dto.ifscCode.toUpperCase(),
                bankName: dto.bankName,
            }
        });

        return {
            success: true,
            message: "User details updated."
        };
    }
}
