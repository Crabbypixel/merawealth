import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { AdminService } from 'src/admin/admin.service';
import { SessionService } from 'src/auth/session.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, AdminService, SessionService]
})
export class CompanyModule {}
