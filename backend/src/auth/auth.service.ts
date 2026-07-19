import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class AuthService {
    constructor(private readonly otpService: OtpService,
        private readonly sessionService: SessionService,
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService
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

            if(user.status !=  UserStatus.ACTIVE) {
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

        // Send OTP to user's email asynchronously (non-blocking)
        try {
            if (user) {
                this.emailService.sendLoginOtp(user.email, otp).catch((err) => {
                    console.error("Background OTP Email Delivery Failed:", err);
                });
            } else if (admin) {
                this.emailService.sendLoginOtp(admin.email, otp).catch((err) => {
                    console.error("Background OTP Email Delivery Failed:", err);
                });
            }
        } catch (error) {
            // Note: This catch block will now only catch synchronous failures (like missing configuration parameters)
            throw new InternalServerErrorException("Unable to initiate OTP process.");
        }

        // Invalidate all previous OTPs for this user, so that only the latest OTP is valid
        await this.prisma.otpLog.updateMany({
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
        await this.prisma.otpLog.create({
            data: {
                otp: otp,
                challenge: challenge,
                expiresAt: expiry,
                userId: userId,
                adminId: adminId,
                role: role
            },
        });

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

        // Compare OTP
        if (otpLog.otp !== dto.otp) {
            throw new BadRequestException({
                success: false,
                message: "Invalid OTP.",
            });
        }

        // Mark the OTP as used, cannot be used later
        await this.prisma.otpLog.update({
            where: {
                id: otpLog.id,
            },
            data: {
                used: true
            }
        });

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
            secure: false,
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
        await this.prisma.user.create({
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
                    email: "admin.email@merawealth.com",
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
