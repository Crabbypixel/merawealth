import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";

export class UpdateCompanyDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    companyName?: string;

    @IsOptional()
    @IsString()
    companyLogo?: string;

    @IsOptional()
    @IsUrl()
    companyUrl?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2})
    @Min(0)
    indicativePrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    minQty?: number;
}