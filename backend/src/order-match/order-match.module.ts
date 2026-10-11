import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { OrderMatchController } from "./order-match.controller";
import { OrderMatchService } from "./order-match.service";

@Module({
    imports: [AuthModule],
    controllers: [OrderMatchController],
    providers: [OrderMatchService]
})
export class OrderMatchModule { }
