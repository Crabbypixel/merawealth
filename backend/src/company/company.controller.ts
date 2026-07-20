import { Body, Controller, Post, UseGuards, Param, Patch, Get, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AdminGuard } from 'src/admin/admin.guard';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import { ClientGuard } from 'src/client/client.guard';
import { GetCompanyDto } from './dto/get-company.dto';
import { GetCompaniesDto } from './dto/get-companies.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { companyLogoFilter, companyLogoStorage } from 'src/common/company-logo.storage';

@Controller("")
export class CompanyController {
    constructor(private readonly companyService: CompanyService) { }

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
    @UseInterceptors(FileInterceptor("logo", {
        storage: companyLogoStorage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: companyLogoFilter
    }))
    @UseGuards(AdminGuard)
    createCompany(@UploadedFile() logo: Express.Multer.File, @Body() dto: CreateCompanyDto) {
        if (!logo) {
            throw new BadRequestException({
                success: false,
                message: "Company logo is required.",
            });
        }
        
        return this.companyService.createCompany(dto, logo);
    }

    // Get company details (by ID)
    @Get("admin/companies/:companyCode")
    @UseGuards(AdminGuard)
    getCompany(@Param("companyCode") companyCode: string) {
        return this.companyService.getCompany(companyCode);
    }

    // Update company details
    @Patch("admin/companies/:companyCode")
    @UseInterceptors(FileInterceptor("logo", {
        storage: companyLogoStorage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: companyLogoFilter
    }))
    @UseGuards(AdminGuard)
    updateCompany(
        @Param("companyCode") companyCode: string,
        @UploadedFile() logo: Express.Multer.File,
        @Body() dto: UpdateCompanyDto
    ) {
        return this.companyService.updateCompany(companyCode, dto, logo);
    }

    // Update company listing status
    @Patch("admin/companies/:companyCode/status")
    @UseGuards(AdminGuard)
    updateCompanyStatus(@Param("companyCode") companyCode: string, @Body() dto: UpdateCompanyStatusDto) {
        return this.companyService.updateCompanyStatus(companyCode, dto);
    }

    // Fetch companies (publicly)
    @Get("companies")
    getCompaniesPublic(@Query() dto: GetCompaniesDto) {
        return this.companyService.getCompaniesPublic(dto);
    }
}
