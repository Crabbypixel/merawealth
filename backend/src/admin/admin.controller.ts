import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';

// Admin guards only allows registered and logged-in admins to access these HTTP endpoints
@UseGuards(AdminGuard)
@Controller("admin")
export class AdminController {
    constructor(private readonly adminService : AdminService) {}

    @Get("users")
    getUsers(@Query() dto: GetUsersDto) {
        return this.adminService.getUsers(dto);
    }

    @Patch("users/:id/status")
    updateUserStatus(@Param("id", ParseIntPipe) id : number, @Body() dto : UpdateUserStatusDto) {
        return this.adminService.updateUserStatus(id, dto);
    }

    @Get("users/:id")
    getUserDetails(@Param("id", ParseIntPipe) id: number) {
        return this.adminService.getUserDetails(id);
    }
    
    @Patch("users/:id")
    updateUser(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
        return this.adminService.updateUser(id, dto);
    }
}
