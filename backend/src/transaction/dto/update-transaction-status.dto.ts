import { TransactionStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Min } from "class-validator";

export class UpdateTransactionStatusDto {
    @IsEnum(TransactionStatus)
    status: TransactionStatus;

    // Required when approving an order (PENDING -> UNDER_PROCESS).
    // Must be between 1 and the quantity the client ordered (checked in the service).
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    approvedQuantity?: number;
}
