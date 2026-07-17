import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClientGuard } from './client.guard';
import { ClientService } from './client.service';

@UseGuards(ClientGuard)
@Controller("client")
export class ClientController {
    constructor(private readonly clientService : ClientService) {}

    @Get("/companies")
    getCompanies() {
        return this.clientService.getCompanies();
    }
}
