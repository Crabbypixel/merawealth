import { Injectable } from "@nestjs/common";
import { randomBytes, randomInt } from 'crypto';

@Injectable()
export class OtpService {
    generateOtp(): number {
        // TODO: Make it dynamic - read from file
        return randomInt(1000, 10000);
    }

    // Generate challenge key
    generateChallenge(): string {
        return randomBytes(32).toString("hex");
    }
}