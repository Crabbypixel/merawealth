import { Injectable } from "@nestjs/common";
import { randomBytes, randomInt } from 'crypto';

@Injectable()
export class OtpService {
    generateOtp(): number {
        // 6 digits: 900,000 possible codes
        return randomInt(100000, 1000000);
    }

    // Generate challenge key
    generateChallenge(): string {
        return randomBytes(32).toString("hex");
    }
}