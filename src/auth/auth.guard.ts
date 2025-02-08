import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        let request = context.switchToHttp().getRequest();
        try {
            let token = this.extractTokenFromHeader(request);
            if (!token) {
                throw new UnauthorizedException();
            }
            let payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.JWT_SECRET,
                }
            );

            request["user"] = payload;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | null {
        let [type, token] = request.headers["authorization"].split(" ") ?? [];
        return type === "Bearer" ? token : null;
    }
}

