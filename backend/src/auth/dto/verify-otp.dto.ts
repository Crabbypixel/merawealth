import { IsNumber, IsString } from "class-validator";

// DTO for verifying OTPs
export class VerifyOtpDto {
    @IsString()
    challenge: string;

    @IsNumber()
    otp: number;
}