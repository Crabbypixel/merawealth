import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, Min } from "class-validator";

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(8)
    @Matches(/^[A-Z0-9]{1,8}$/)
    companyCode: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    companyName: string;

    @IsOptional()
    @IsString()
    companyLogo?: string;

    @IsOptional()
    @IsUrl()
    companyUrl?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    shortNote?: string;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    indicativePrice: number;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    minQty: number;
}