import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ClientGuard } from 'src/client/client.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import type { Request } from "express";
import { AdminGuard } from 'src/admin/admin.guard';
import { GetTransactionDto } from './dto/get-transactions.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { EmailService } from 'src/email/email.service';

@Controller("")
export class TransactionController {
    constructor(private readonly transactionService : TransactionService) {}
    
    // Get transactions done by all clients (can send status of transactions to filter accordingly)
    @Get("admin/transactions")
    @UseGuards(AdminGuard)
    getTransactionsAdmin(@Query() query : GetTransactionDto) {
        return this.transactionService.getTransactionsAdmin(query);
    }

    // Update transaction status
    @Patch("admin/transactions/:id")
    @UseGuards(AdminGuard)
    updateTransactionStatus(@Param("id", ParseIntPipe) id: number, @Body() dto : UpdateTransactionStatusDto) {
        return this.transactionService.updateTransactionStatus(id, dto);        
    }

    // Get transactions done by user (can send status of transactions to filter accordingly)
    @Get("client/transactions")
    @UseGuards(ClientGuard)
    getTransactionsClient(@Req() req : Request, @Query() query: GetTransactionDto) {
        return this.transactionService.getTransactionsClient(req, query);
    }

    // Create a transaction - client
    @Post("client/transactions")
    @UseGuards(ClientGuard)
    createTransaction(@Req() req : Request, @Body() dto : CreateTransactionDto) {
        return this.transactionService.createTransaction(req, dto);
    }

    // Cancel a transaction - by client
    @Patch("client/transactions/:id/cancel")
    @UseGuards(ClientGuard)
    cancelTranscationClient(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
        return this.transactionService.cancelTranscationClient(id, req);
    }
}
