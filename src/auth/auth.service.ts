import * as bcrypt from "bcrypt";
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UsersSignInDto } from './dto/users.sign_in.dto';
import { JwtService } from "@nestjs/jwt";
import { UsersJwtDto } from "./dto/users.jwt.dto";
import { UsersSignUpDto } from "./dto/users.sign_up.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    async signIn(user: UsersSignInDto): Promise<UsersJwtDto> {
        let foundUser = await this.usersService.findOne(user.login);
        if (!bcrypt.compare(foundUser?.password, user.password) || foundUser === null) {
            throw new UnauthorizedException();
        }
        let payload = { id: foundUser.id, username: foundUser.username };
        return { access_token: await this.jwtService.signAsync(payload) };
    }

    async signUp(user: UsersSignUpDto): Promise<UsersJwtDto> {
        let foundUser = await this.usersService.findOne(user.login);
        if (foundUser !== null) {
            throw new ConflictException({ message: "user already exists" });
        }

        if (user.password !== user.confirmPassword) {
            throw new BadRequestException({ message: "passwords don't match, they should be the same" });
        }

        let createdUser = await this.usersService.createUser(user.login, user.password);

        let payload = { id: createdUser.id, username: createdUser.username };
        return { access_token: await this.jwtService.signAsync(payload) };
    }
}
