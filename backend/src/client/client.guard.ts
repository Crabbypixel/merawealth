import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Role } from "@prisma/client";
import { SessionService } from "src/auth/session.service";
import { Request } from "express";

@Injectable()
export class ClientGuard implements CanActivate {
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

        if(session.role !== Role.CLIENT) {
            throw new ForbiddenException({
                success: false,
                message: "Client access required."
            });
        }

        if(!session.user) {
            throw new UnauthorizedException({
                success: false,
                message: "Invalid session."
            });
        }

        if(session.user.status !== "ACTIVE") {
            throw new ForbiddenException({
                success: false,
                message: "Account is not active."
            });
        }

        return true;
    }
}