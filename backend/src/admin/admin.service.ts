import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class AdminService {
    constructor(private readonly prisma : PrismaService) {}

    async getPendingUsers() {
        const users = await this.prisma.user.findMany({
            where: {
                status: "PENDING"
            }
        });

        return {
            success: true,
            users
        }
    }

    async updateUserStatus(id: number, dto: UpdateUserStatusDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if(!user) {
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
}
