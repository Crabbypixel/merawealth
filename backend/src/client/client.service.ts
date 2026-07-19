import { Injectable } from '@nestjs/common';
import { CompanyStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientService {
    constructor(private readonly prisma : PrismaService) {}
}
