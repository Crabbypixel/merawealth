import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class SessionService {
    constructor(private readonly prisma: PrismaService) { }

    // Generate a random session token
    generateSessionToken(): string {
        return randomBytes(32).toString("hex");
    }

    // Create a new user session
    async createSession(role: Role, userId: number | null, adminId: number | null) {
        switch (role) {
            case Role.ADMIN:
            {
                if(adminId === null)
                    throw new Error("Admin ID is null");

                // Invalidate all previous sessions
                /* await this.invalidateSessions(adminId); */
                await this.prisma.session.updateMany({
                    where: {
                        adminId: adminId,
                        isActive: true,
                    },
                    data: {
                        isActive: false,
                        logoutAt: new Date(),
                        terminationReason: "NEW_LOGIN",
                    }
                });

                const token = this.generateSessionToken();

                // TODO: Make this dynamic - read from file
                const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                // Create a session in DB
                await this.prisma.session.create({
                    data: {
                        sessionToken: token,
                        expiresAt: expiry,
                        adminId: adminId,
                        userId: null,
                        role,
                    },
                });

                return token;
            }

            case Role.CLIENT:
            {
                if(userId === null)
                    throw new Error("Admin ID is null");
                // Invalidate all previous sessions
                await this.prisma.session.updateMany({
                    where: {
                        userId: userId,
                        isActive: true
                    },
                    data: {
                        isActive: false,
                        logoutAt: new Date(),
                        terminationReason: "NEW_LOGIN"
                    }
                });

                const token = this.generateSessionToken();

                // TODO: Make this dynamic - read from file
                const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                // Create a session in DB
                await this.prisma.session.create({
                    data: {
                        sessionToken: token,
                        expiresAt: expiry,
                        userId: userId,
                        adminId: null,
                        role
                    }
                });

                return token;
            }

            default:
                throw new Error("Unknown session role.");
        }
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
                user: true,
                admin: true
            }
        });
    }

    async logout(sessionToken: string) {
        // Just mark the active tag to false as the user cannot login twice.
        // Browser cookie also gets deleted.
        // Might be helpful to keep session history.
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