import { Injectable } from "@nestjs/common";
import { randomBytes, randomInt } from 'crypto';

@Injectable()
export class OtpService {
    generateOtp(): number {
        // 4 digits; guessing is limited by MAX_OTP_ATTEMPTS in AuthService
        return randomInt(1000, 10000);
    }

    // Generate challenge key
    generateChallenge(): string {
        return randomBytes(32).toString("hex");
    }
}