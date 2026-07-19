import { Body, Controller, Post, UseGuards, Param, Patch, Get, Query } from '@nestjs/common';
import { AdminGuard } from 'src/admin/admin.guard';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import { ClientGuard } from 'src/client/client.guard';
import { GetCompanyDto } from './dto/get-company.dto';

@Controller("")
export class CompanyController {
    constructor(private readonly companyService : CompanyService) {}

    // Get all companies
    @Get("admin/companies")
    @UseGuards(AdminGuard)
    getCompaniesAdmin(@Query() query: GetCompanyDto) {
        return this.companyService.getCompaniesAdmin(query);
    }

    // Get all active companies, for client
    @Get("client/companies")
    @UseGuards(ClientGuard)
    getCompanies(@Query() query: GetCompanyDto) {
        return this.companyService.getCompaniesClient(query);
    }

    // Create a company list
    @Post("admin/companies")
    @UseGuards(AdminGuard)
    createCompany(@Body() dto : CreateCompanyDto) {
        return this.companyService.createCompany(dto);
    }

    // Update company details
    @Patch("admin/companies/:companyCode")
    @UseGuards(AdminGuard)
    updateCompany(@Param("companyCode") companyCode : string, @Body() dto: UpdateCompanyDto) {
        return this.companyService.updateCompany(companyCode, dto);
    }j

    // Update company listing status
    @Patch("admin/companies/:companyCode/status")
    @UseGuards(AdminGuard)
    updateCompanyStatus(@Param("companyCode") companyCode : string, @Body() dto : UpdateCompanyStatusDto) {
        return this.companyService.updateCompanyStatus(companyCode, dto);
    }
}
