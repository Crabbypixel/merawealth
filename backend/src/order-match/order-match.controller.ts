import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { AdminGuard } from "src/admin/admin.guard";
import { ConfirmOrderMatchDto } from "./dto/confirm-order-match.dto";
import { OrderMatchService } from "./order-match.service";

// Manual order matching - admin only
@UseGuards(AdminGuard)
@Controller("admin/order-match")
export class OrderMatchController {
    constructor(private readonly orderMatchService: OrderMatchService) { }

    // Companies that have buy and sell orders waiting to be matched
    @Get("companies")
    getCompanies() {
        return this.orderMatchService.getCompanies();
    }

    // Sellers and buyers of one company, for the matching screen
    @Get(":companyCode")
    getCompanyOrders(@Param("companyCode") companyCode: string) {
        return this.orderMatchService.getCompanyOrders(companyCode);
    }

    // Save the admin's matches for one company
    @Post(":companyCode/confirm")
    confirm(@Req() req: Request, @Param("companyCode") companyCode: string, @Body() dto: ConfirmOrderMatchDto) {
        return this.orderMatchService.confirm(req, companyCode, dto);
    }
}
