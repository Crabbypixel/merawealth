import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { TasksService } from "./tasks.service";

@Module({
    providers: [TasksService],
})
export class TasksModule {}