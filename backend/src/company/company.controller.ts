import { Body, Controller, Post, UseGuards, Param, Patch, Get } from '@nestjs/common';
import { AdminGuard } from 'src/admin/admin.guard';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';

@Controller("admin/companies")
@UseGuards(AdminGuard)
export class CompanyController {
    constructor(private readonly companyService : CompanyService) {}

    @Get()
    getCompanies() {
        return this.companyService.getCompanies();
    }

    @Post()
    createCompany(@Body() dto : CreateCompanyDto) {
        return this.companyService.createCompany(dto);
    }

    @Patch(":companyCode")
    updateCompany(@Param("companyCode") companyCode : string, @Body() dto: UpdateCompanyDto) {
        return this.companyService.updateCompany(companyCode, dto);
    }j

    @Patch(":companyCode/status")
    updateCompanyStatus(@Param("companyCode") companyCode : string, @Body() dto : UpdateCompanyStatusDto) {
        return this.companyService.updateCompanyStatus(companyCode, dto);
    }
}
