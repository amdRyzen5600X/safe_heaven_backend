import * as bcrypt from "bcrypt";
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UsersSignInDto } from './dto/users.sign_in.dto';
import { JwtService } from "@nestjs/jwt";
import { UsersJwtDto } from "./dto/users.jwt.dto";
import { UsersSignUpDto } from "./dto/users.sign_up.dto";
import { UsersJwtPayloadDto } from "./dto/users.jwt-payload.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    async signIn(user: UsersSignInDto): Promise<UsersJwtDto> {
        let foundUser = await this.usersService.findByUsername(user.login);
        if (foundUser === null || !bcrypt.compare(foundUser?.password, user.password)) {
            throw new UnauthorizedException({ message: "password or username is wrong"});
        }
        let payload: UsersJwtPayloadDto = { id: foundUser.id, username: foundUser.username };
        return {
            access_token: await this.jwtService.signAsync(payload, {expiresIn: "1d"}),
            refresh_token: await this.jwtService.signAsync(payload, {expiresIn: "7d"})
        };
    }

    async signUp(user: UsersSignUpDto): Promise<UsersJwtDto> {
        let foundUser = await this.usersService.findByUsername(user.login);
        if (foundUser !== null) {
            throw new ConflictException({ message: "user already exists" });
        }

        if (user.password !== user.confirmPassword) {
            throw new BadRequestException({ message: "passwords don't match, they should be the same" });
        }

        let createdUser = await this.usersService.createUser(user.login, user.password);

        let payload: UsersJwtPayloadDto = { id: createdUser.id, username: createdUser.username };
        return {
            access_token: await this.jwtService.signAsync(payload, {expiresIn: "1d"}),
            refresh_token: await this.jwtService.signAsync(payload, {expiresIn: "7d"})
        };
    }

    async refresh(refresh_token: string | undefined): Promise<UsersJwtDto> {
        let payload: UsersJwtPayloadDto = await this.verify(refresh_token);
        let user = await this.usersService.findById(payload.id);
        if (user === null) {
            throw new UnauthorizedException();
        }
        return {
            access_token: await this.jwtService.signAsync(payload, {expiresIn: "1d"}),
            refresh_token: await this.jwtService.signAsync(payload, {expiresIn: "7d"})
        };
    }

    async verify(rawToken: string | undefined): Promise<UsersJwtPayloadDto> {
        if (!rawToken) {
            throw new UnauthorizedException();
        }
        let token = this.extractTokenFromHeader(rawToken);
        if (!token) {
            throw new UnauthorizedException();
        }
        let payload: UsersJwtPayloadDto = await this.jwtService.verifyAsync(
            token,
            {
                secret: process.env.JWT_SECRET,
            }
        );
        return payload;
    }

    private extractTokenFromHeader(rawToken: string): string | null {
        let [type, token] = rawToken.split(" ") ?? [];
        return type === "Bearer" ? token : null;
    }
}
