import { IsEmail, IsString, Matches } from "class-validator";

export class RegisterDto {
    @IsString()
    name: string;

    @Matches(/^\d{10}$/)
    phoneNumber: string;

    @IsEmail()
    email: string;
}