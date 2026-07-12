import { Injectable } from "@nestjs/common";
import { randomBytes, randomInt } from 'crypto';

@Injectable()
export class OtpService {
    generateOtp(): number {
        return randomInt(1000, 10000);
    }

    generateChallenge(): string {
        return randomBytes(32).toString("hex");
    }
}