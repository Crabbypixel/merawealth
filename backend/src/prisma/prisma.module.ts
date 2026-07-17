import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/*
 * Global module that provides a single shared PrismaService instance.
 * Once imported into AppModule, PrismaService can be injected into any
 * module without needing to re-import PrismaModule.
 */

@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}