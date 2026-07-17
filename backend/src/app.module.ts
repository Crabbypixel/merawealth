import { ConfigModule } from "@nestjs/config";
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from "./tasks/tasks.module";
import { AdminModule } from './admin/admin.module';
import { CompanyModule } from './company/company.module';
import { ClientModule } from './client/client.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    AuthModule, 
    PrismaModule,
    TasksModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AdminModule,
    CompanyModule,
    ClientModule,
    TransactionModule
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
