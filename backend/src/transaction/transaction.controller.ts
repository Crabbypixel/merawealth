import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ClientGuard } from 'src/client/client.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import type { Request } from "express";

@Controller("")
export class TransactionController {
    constructor(private readonly transactionService : TransactionService) {}

    @Post("client/transactions")
    @UseGuards(ClientGuard)
    createTransaction(@Req() req : Request, @Body() dto : CreateTransactionDto) {
        return this.transactionService.createTransaction(req, dto);
    }
}
