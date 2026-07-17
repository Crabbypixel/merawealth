import { Injectable } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/*
 * Prisma client managed by NestJS as a singleton provider.
 * A single shared instance manages the PostgreSQL connection pool
 * and is injected wherever database access is required.
 */

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL!,
        });

        super({ adapter });
    }
}