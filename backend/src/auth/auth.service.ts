import { Injectable, BadRequestException, HttpException, HttpStatus, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RequestOtpDto } from './dto/request-otp.dto';
import { OtpService } from './otp.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import isEmail from "validator/lib/isEmail";
import { SessionService } from './session.service';
import type { Response } from "express";
import { Request } from "express";
import { Role, UserStatus } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import { AdminAlertService } from 'src/email/admin-alert.service';

const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_GAP_MS = 60 * 1000;

@Injectable()
export class AuthService {
    constructor(private readonly otpService: OtpService,
        private readonly sessionService: SessionService,
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
        private readonly adminAlert: AdminAlertService
    ) { }

    // Request OTP backend
    async requestOtp(dto: RequestOtpDto) {
        // Check for valid phone number
        if (!/^\d{10}$/.test(dto.phoneNumber)) {
            throw new BadRequestException({
                success: false,
                message: "Enter a valid phone number."
            });
        }

        // Get user from phone number, search from both admin and user table
        const [admin, user] = await Promise.all([
            this.prisma.admin.findUnique({
                where: {
                    phoneNumber: dto.phoneNumber
                }
            }),
            this.prisma.user.findUnique({
                where: {
                    phoneNumber: dto.phoneNumber
                }
            })
        ]);

        let role: Role;
        let userId: number | null = null;
        let adminId: number | null = null;

        if (admin && user) {
            throw new BadRequestException({
                success: false,
                message: "Admin cannot be client"
            });
        }

        if (admin) {
            role = Role.ADMIN;
            adminId = admin.id;
        }
        else if (user) {
            role = Role.CLIENT;
            userId = user.id;

            if (user.status != UserStatus.ACTIVE) {
                throw new NotFoundException({
                    success: false,
                    message: "Account pending approval."
                });
            }
        }
        else {
            throw new BadRequestException({
                success: false,
                message: "User not registered."
            });
        }

        // Generate OTP and challenge key
        const otp = this.otpService.generateOtp();
        const challenge = this.otpService.generateChallenge();
        const expiry = new Date(Date.now() + 5 * 60 * 1000);     // 5 minutes

        // Check, invalidate and create in one transaction, locked per account, so
        // parallel requests can't slip past the one-a-minute rule or leave two live codes
        await this.prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`otp:${role}:${userId ?? adminId}`}))`;

            // One code per account per minute, so nobody can flood an inbox
            const lastOtp = await tx.otpLog.findFirst({
                where: { userId, adminId },
                orderBy: { createdAt: "desc" },
                select: { createdAt: true },
            });
            if (lastOtp) {
                const waitSeconds = Math.ceil((lastOtp.createdAt.getTime() + OTP_RESEND_GAP_MS - Date.now()) / 1000);
                if (waitSeconds > 0) {
                    throw new HttpException({
                        success: false,
                        message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`
                    }, HttpStatus.TOO_MANY_REQUESTS);
                }
            }

            // Invalidate all previous OTPs for this user, so that only the latest OTP is valid
            await tx.otpLog.updateMany({
                where: {
                    userId: userId,
                    adminId: adminId,
                    used: false
                },
                data: {
                    used: true
                }
            });

            // Add new OTP entry
            await tx.otpLog.create({
                data: {
                    otp: otp,
                    challenge: challenge,
                    expiresAt: expiry,
                    userId: userId,
                    adminId: adminId,
                    role: role
                },
            });
        });

        // Send OTP to user's email asynchronously (non-blocking), only once it is saved
        const recipient = user ?? admin;
        if (recipient) {
            this.emailService.sendLoginOtp(recipient.email, otp, !user).catch((err) => {
                console.error("Background OTP Email Delivery Failed:", err);
            });
        }

        // The frontend sends { challenge key + OTP }, not { phoneNumber + OTP },
        // as it's more secure to send a key, one can easily tamper phone number
        // but tampering challenge key is meaningless.
        return {
            success: true,
            challenge,
            message: "OTP sent."
        };
    }

    // Verify OTP backend
    async verifyOtp(dto: VerifyOtpDto, res: Response) {
        // Get OTP information and join with the corresponding user
        const otpLog = await this.prisma.otpLog.findUnique({
            where: {
                challenge: dto.challenge
            },
            include: {
                user: true,
                admin: true
            }
        });

        // Check if OTP has been requested
        if (!otpLog) {
            throw new BadRequestException({
                success: false,
                message: "Invalid login challenge.",
            });
        }

        // Check if OTP has already been used
        if (otpLog.used) {
            throw new BadRequestException({
                success: false,
                message: "Login challenge already used."
            });
        }

        // Check if the OTP has expired
        if (otpLog.expiresAt < new Date()) {
            throw new BadRequestException({
                success: false,
                message: "OTP has expired."
            });
        }

        // Count this guess before comparing. The condition makes it safe when many
        // guesses arrive at once: only MAX_OTP_ATTEMPTS of them can ever get through.
        const counted = await this.prisma.otpLog.updateMany({
            where: { id: otpLog.id, used: false, attempts: { lt: MAX_OTP_ATTEMPTS } },
            data: { attempts: { increment: 1 } }
        });

        if (counted.count === 0) {
            throw new BadRequestException({
                success: false,
                message: "Too many wrong attempts. Please request a new OTP."
            });
        }

        // Compare OTP
        if (otpLog.otp !== dto.otp) {
            const attemptsLeft = Math.max(0, MAX_OTP_ATTEMPTS - (otpLog.attempts + 1));
            throw new BadRequestException({
                success: false,
                message: attemptsLeft > 0
                    ? `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left.`
                    : "Too many wrong attempts. Please request a new OTP.",
            });
        }

        // Mark the OTP as used in one step, so two requests with the same code
        // can't both log in
        const claimed = await this.prisma.otpLog.updateMany({
            where: { id: otpLog.id, used: false },
            data: { used: true }
        });

        if (claimed.count === 0) {
            throw new BadRequestException({
                success: false,
                message: "Login challenge already used."
            });
        }

        // Get role (Admin or client)
        const role = otpLog.role;

        // If client, allow only if verified
        if (role === Role.CLIENT && otpLog.user) {
            switch (otpLog.user.status) {
                case "PENDING":
                    throw new ForbiddenException({
                        success: false,
                        message: "Account pending approval.",
                        status: otpLog.user.status,
                    });

                case "REJECTED":
                    throw new ForbiddenException({
                        success: false,
                        message: "Your account has been rejected.",
                        status: otpLog.user.status,
                    });

                case "INACTIVE":
                    throw new ForbiddenException({
                        success: false,
                        message: "Account inactive.",
                        status: otpLog.user.status,
                    });
            }
        }

        // Success - OTP is valid and initiate session creation
        // Create a new session token
        const sessionToken = await this.sessionService.createSession(role, otpLog.userId, otpLog.adminId);

        // Send a cookie
        res.cookie("session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            success: true,
            message: "OTP verified successfully.",
            role: role
        };
    }

    // Register user backend
    async register(dto: RegisterDto) {
        // Check for existing users
        const [existingUser, existingAdmin] = await Promise.all([
            this.prisma.user.findFirst({
                // Users must have unique emails and phone numbers
                where: {
                    OR: [{ phoneNumber: dto.phoneNumber }, { email: dto.email }]
                }
            }),

            this.prisma.admin.findUnique({
                where: {
                    phoneNumber: dto.phoneNumber
                }
            }),
        ]);

        // If user already exists
        if (existingUser || existingAdmin) {
            throw new BadRequestException({
                success: false,
                message: "User already exists."
            });
        }

        // Check for valid phone number
        if (!/^\d{10}$/.test(dto.phoneNumber)) {
            throw new BadRequestException({
                success: false,
                message: "Enter a valid phone number."
            });
        }

        // Check for valid email
        if (!isEmail(dto.email)) {
            throw new BadRequestException({
                success: false,
                message: "Enter a valid email address."
            });
        }

        // Create a new entry in the user table
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                phoneNumber: dto.phoneNumber,
                email: dto.email,

                panNumber: dto.panNumber?.toUpperCase(),
                dematClientId: dto.dematClientId?.toUpperCase(),
                dematDpId: dto.dematDpId?.toUpperCase(),

                bankAccountNo: dto.bankAccountNo,

                ifscCode: dto.ifscCode?.toUpperCase(),
                bankName: dto.bankName,
            }
        });

        // Tell the admins; runs in the background and never fails the registration
        void this.adminAlert.newRegistration(user.id);

        // Return a success JSON
        return {
            success: true,
            message: "Registration successful. We'll contact you for activation."
        }
    }

    // Profile backend
    async me(req: Request) {
        // Check for valid session token from cookies
        const sessionToken = req.cookies.session;

        if (!sessionToken) {
            throw new UnauthorizedException({
                success: false,
                message: "Not logged in."
            });
        }

        // Get session information from the session token from the sessions table
        const session = await this.sessionService.findSession(sessionToken);
        if (!session) {
            throw new UnauthorizedException({
                success: false,
                message: "Invalid Session."
            });
        }

        // Return profile JSON
        if (session.role === Role.ADMIN && session.admin) {
            return ({
                success: true,
                user: {
                    id: session.admin.id,
                    name: session.admin.name,
                    email: session.admin.email,
                    phoneNumber: session.admin.phoneNumber
                },
                role: session.role
            });
        }
        else if (session.role === Role.CLIENT && session.user) {
            switch (session.user.status) {
                case UserStatus.PENDING:
                    console.log("PENDING");
                    throw new ForbiddenException({
                        success: false,
                        message: "Account pending approval.",
                        status: session.user.status
                    });

                case UserStatus.REJECTED:
                    console.log("REJECTED");
                    throw new ForbiddenException({
                        success: false,
                        message: "Your account has been rejected.",
                        status: session.user.status
                    });

                case UserStatus.INACTIVE:
                    console.log("INACTIVE");
                    throw new ForbiddenException({
                        success: false,
                        message: "Inactive account.",
                        status: session.user.status
                    });
            }

            return ({
                success: true,
                user: {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                    phoneNumber: session.user.phoneNumber
                },
                role: session.role
            });
        }
        else {
            throw new UnauthorizedException({
                success: false,
                message: "Invalid session."
            })
        }
    }

    // Logout backend
    async logout(req: Request, res: Response) {
        // Get session token from cookies
        const sessionToken = req.cookies.session;
        if (sessionToken) {
            await this.sessionService.logout(sessionToken);
        }

        // Clear browser cookies
        res.clearCookie("session");

        // Return a success JSON
        return {
            success: true,
            message: "Logged out successfully."
        }
    }
}
