import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RequestOtpDto } from './dto/request-otp.dto';
import { OtpService } from './otp.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import isEmail from "validator/lib/isEmail";
import { SessionService } from './session.service';
import type { Response } from "express";
import { Request } from "express";

@Injectable()
export class AuthService {
    constructor(private readonly otpService : OtpService,
                private readonly sessionService: SessionService,
                private readonly prisma : PrismaService
    ) {}

    async requestOtp(dto: RequestOtpDto) {
        if (!/^\d{10}$/.test(dto.phoneNumber)) {
            throw new BadRequestException({
                success: false,
                message: "Enter a valid phone number."
            });
        }

        const user = await this.prisma.user.findUnique({
            where: {
                phoneNumber: dto.phoneNumber,
            },
        });

        if(!user) {
            throw new BadRequestException({
                success: false,
                message: "User not registered.",
            });
        }

        const otp = this.otpService.generateOtp();
        const challenge = this.otpService.generateChallenge();
        const expiry = new Date(Date.now() + 5 * 60 * 1000);     // 5 minutes

        // Invalidate all previous OTPs for this user, so that only the latest OTP is valid
        await this.prisma.otpLog.updateMany({
            where: {
                userId: user.id,
                used: false
            },
            data: {
                used: true
            }
        });

        await this.prisma.otpLog.create({
            data: {
                otp: otp,
                challenge: challenge,
                expiresAt: expiry,
                userId: user.id,
            },
        });

        console.log("Phone: ", dto.phoneNumber);
        console.log("Generated OTP: ", otp);

        return {
            success: true,
            challenge,
            message: "OTP sent."
        };
    }

    async verifyOtp(dto : VerifyOtpDto, res: Response) {
        const otpLog = await this.prisma.otpLog.findUnique({
            where: {
                challenge: dto.challenge
            },
            include: {
                user: true,
            }
        });

        // Check if OTP has been requested
        if(!otpLog) {
            throw new BadRequestException({
                success: false,
                message: "Invalid login challenge.",
            });
        }

        // Check if OTP has already been used
        if(otpLog.used) {
            throw new BadRequestException({
                success: false,
                message: "Login challenge already used."
            });
        }

        // Check if the OTP has expired
        if(otpLog.expiresAt < new Date()) {
            throw new BadRequestException({
                success: false,
                message: "OTP has expired."
            });
        }

        // Compare OTP
        if(otpLog.otp !== dto.otp) {
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

        const sessionToken = await this.sessionService.createSession(otpLog.userId);

        res.cookie("session", sessionToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            success: true,
            message: "OTP verified successfully.",
            //sessionToken,
        };
    }

    async register(dto : RegisterDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [ { phoneNumber: dto.phoneNumber }, { email: dto.email } ]
            }
        });

        // If user already exists
        if(existingUser) {
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

        await this.prisma.user.create({
            data: {
                name: dto.name,
                phoneNumber: dto.phoneNumber,
                email: dto.email
            }
        });

        return {
            success: true,
            message: "Registration successful."
        }
    }
    
    async me(req: Request) {
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
                message: "Invalid Session."
            });
        }

        return ({
            success: true,
            user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                phoneNumber: session.user.phoneNumber
            }
        });
    }

    async logout(req: Request, res: Response) {
        const sessionToken = req.cookies.session;

        if(sessionToken) {
            await this.sessionService.logout(sessionToken);
        }

        res.clearCookie("session");

        return {
            success: true,
            message: "Logged out successfully."
        }
    }
}
