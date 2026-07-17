import { IsString } from "class-validator";

// DTO for requesting OTP - just a phone number
export class RequestOtpDto {
    @IsString()
    phoneNumber: string;
}