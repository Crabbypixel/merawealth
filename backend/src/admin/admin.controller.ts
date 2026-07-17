import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

// Admin guards only allows registered and logged-in admins to access these HTTP endpoints
@UseGuards(AdminGuard)
@Controller("admin")
export class AdminController {
    constructor(private readonly adminService : AdminService) {}

    @Get("pending-users")
    getPendingUsers() {
        return this.adminService.getPendingUsers();
    }

    @Patch("users/:id/status")
    updateUserStatus(@Param("id", ParseIntPipe) id : number, @Body() dto : UpdateUserStatusDto) {
        return this.adminService.updateUserStatus(id, dto);
    }
}
