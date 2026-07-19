import { IsEmail, IsString, Length, Matches } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @Length(1, 100)
    name: string;

    @Matches(/^[6-9]\d{9}$/, { message: "Invalid phone number." })
    phoneNumber: string;

    @IsEmail({}, { message: "Invalid email address." })
    email: string;

    @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, { message: "Invalid PAN number." })
    panNumber: string;

    @Matches(/^[A-Z0-9]{8}$/, { message: "Invalid Demat Client ID." })
    dematClientId: string;

    @Matches(/^[A-Z0-9]{8}$/, { message: "Invalid Demat DP ID." })
    dematDpId: string;

    @IsString()
    @Length(1, 30)
    bankAccountNo: string;

    @IsString()
    @Length(11)
    ifscCode: string;

    @IsString()
    @Length(1, 100)
    bankName: string;
}