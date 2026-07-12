import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SessionService {
    constructor(private readonly prisma : PrismaService) {}

    generateSessionToken(): string {
        return randomBytes(32).toString("hex");
    }

    async invalidateSessions(userId: number) {
        await this.prisma.session.updateMany({
            where: {
                userId,
                isActive: true,
            },
            data: {
                isActive: false,
                logoutAt: new Date(),
                terminationReason: "NEW_LOGIN",
            }
        });
    }

    async createSession(userId: number) {
        await this.invalidateSessions(userId);

        const token = this.generateSessionToken();
        const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.prisma.session.create({
            data: {
                sessionToken: token,
                expiresAt: expiry,
                userId,
            },
        });

        return token;
    }

    async findSession(sessionToken: string) {
        return await this.prisma.session.findFirst({
            where: {
                sessionToken,
                isActive: true,
                expiresAt: {
                    gt: new Date()              // Clear expired sessions
                }
            },
            include: {
                user: true
            }
        });
    }

    async logout(sessionToken: string) {
        await this.prisma.session.updateMany({
            where: {
                sessionToken,
                isActive: true
            },
            data: {
                isActive: false,
                logoutAt: new Date(),
                terminationReason: "LOGOUT"
            }
        });
    }
}