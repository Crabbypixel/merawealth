import { Body, Controller, Post, Res, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RequestOtpDto } from "./dto/request-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { RegisterDto } from "./dto/register.dto";
import { Req } from "@nestjs/common";
import type { Response } from "express";
import * as Express from 'express';
import { Throttle } from "@nestjs/throttler";

// Handles user authentication endpoints (OTP, registration, session management)
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @Post("request-otp")
    requestOtp(@Body() dto : RequestOtpDto) {
        return this.authService.requestOtp(dto);
    }

    @Throttle({ default: { limit: 10, ttl: 60_000 } })
    @Post("verify-otp")
    verifyOtp(@Body() dto : VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.verifyOtp(dto, res);
    }

    @Throttle({ default: { limit: 10, ttl: 15 * 60_000 } })
    @Post("register")
    register(@Body() dto : RegisterDto) {
        return this.authService.register(dto);
    }

    @Get("me")
    async me(@Req() req : Express.Request) {
        return this.authService.me(req);
    }

    @Post("logout")
    async logout(@Req() req : Express.Request, @Res({ passthrough: true }) res: Response) {
        return this.authService.logout(req, res);
    }
}
