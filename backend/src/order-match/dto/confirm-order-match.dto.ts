import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsInt, IsString, Min, ValidateNested } from "class-validator";

export class OrderMatchEntryDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    transactionId: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    matchQuantity: number;

    // Typed by the admin; trimmed, upper-cased and length-checked in the service.
    @IsString()
    matchId: string;

    // The order's updatedAt when the matching screen loaded it, so the server can
    // refuse if the order changed in the meantime.
    @IsDateString()
    updatedAt: string;
}

export class ConfirmOrderMatchDto {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(1000)
    @ValidateNested({ each: true })
    @Type(() => OrderMatchEntryDto)
    entries: OrderMatchEntryDto[];
}
