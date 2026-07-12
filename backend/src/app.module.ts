import { ConfigModule } from "@nestjs/config";
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from "./tasks/tasks.module";

@Module({
  imports: [
    AuthModule, 
    PrismaModule,
    TasksModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    })
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
