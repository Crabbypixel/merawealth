import { TransactionType } from "@prisma/client"
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator"

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    companyCode: string;

    @IsEnum(TransactionType)
    type: TransactionType;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    // Keeps quantity inside the database column; the order value is checked in the service
    @Max(10_000_000, { message: "Maximum quantity is 1,00,00,000 shares." })
    quantity: number;
}