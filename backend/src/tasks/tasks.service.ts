import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) {}

    @Cron(CronExpression.EVERY_5_MINUTES)
    async cleanupExpiredSessions() {
        const result = await this.prisma.session.updateMany({
            where: {
                isActive: true,
                expiresAt: {
                    lt: new Date()
                }
            },
            data: {
                isActive: false,
                expiresAt: new Date(),
                terminationReason: "EXPIRED"
            }
        });

        if(result.count > 0) {
            console.log(`Cleaned up ${result.count} expired session(s).`);
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async deleteExpiredOtps() {
        const result = await this.prisma.otpLog.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        if(result.count > 0) {
            console.log(`Deleted ${result.count} expired OTP(s).`);
        }
    }
}