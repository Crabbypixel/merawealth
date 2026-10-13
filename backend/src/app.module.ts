import { ConfigModule } from "@nestjs/config";
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from "./tasks/tasks.module";
import { AdminModule } from './admin/admin.module';
import { CompanyModule } from './company/company.module';
import { ClientModule } from './client/client.module';
import { TransactionModule } from './transaction/transaction.module';
import { OrderMatchModule } from './order-match/order-match.module';
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    TasksModule,
    ScheduleModule.forRoot(),
    // Per-visitor request limit. Login, register and order routes set tighter limits with @Throttle.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 300 }],
      errorMessage: "Too many requests. Please wait a minute and try again.",
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),
      serveRoot: "/uploads",
    }),
    AdminModule,
    CompanyModule,
    ClientModule,
    TransactionModule,
    OrderMatchModule
  ],

  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule { }
