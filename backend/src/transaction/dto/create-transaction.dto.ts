import { TransactionType } from "@prisma/client"
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from "class-validator"

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    companyCode: string;

    @IsEnum(TransactionType)
    type: TransactionType;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity: number;
}