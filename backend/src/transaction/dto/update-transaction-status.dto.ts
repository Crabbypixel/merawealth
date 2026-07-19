import { TransactionStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateTransactionStatusDto {
    @IsEnum(TransactionStatus)
    status: TransactionStatus;
}