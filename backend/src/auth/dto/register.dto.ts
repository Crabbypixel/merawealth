import { IsString } from "class-validator";

// DTO for user registration
export class RegisterDto {
    @IsString()
    name: string;

    @IsString()
    phoneNumber: string;

    @IsString()
    email: string;
}