import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { AdminAlertService } from "./admin-alert.service";

@Module({
    providers: [EmailService, AdminAlertService],
    exports: [EmailService, AdminAlertService],
})
export class EmailModule {}