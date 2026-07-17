import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Role } from "@prisma/client";
import { SessionService } from "src/auth/session.service";
import { Request } from "express";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private readonly sessionService : SessionService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const sessionToken = request.cookies.session;

        if(!sessionToken) {
            throw new UnauthorizedException({
                success: false,
                message: "Not logged in."
            });
        }

        const session = await this.sessionService.findSession(sessionToken);
        if(!session) {
            throw new UnauthorizedException({
                success: false,
                message: "Invalid session."
            });
        }

        if(session.role !== Role.ADMIN) {
            throw new ForbiddenException({
                success: false,
                message: "Admin access required."
            });
        }

        return true;
    }
}