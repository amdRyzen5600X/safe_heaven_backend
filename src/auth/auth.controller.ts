import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersSignInDto } from './dto/users.sign_in.dto';
import { UsersJwtDto } from './dto/users.jwt.dto';
import { Public } from './auth.guard';
import { UsersSignUpDto } from './dto/users.sign_up.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("/sign-in")
    signIn(@Body() user: UsersSignInDto): Promise<UsersJwtDto> {
        return this.authService.signIn(user);
    }

    @Public()
    @HttpCode(HttpStatus.CREATED)
    @Post("/sign-up")
    signUp(@Body() user: UsersSignUpDto): Promise<UsersJwtDto> {
        return this.authService.signUp(user);
    }

    @Get("/profile")
    profile(@Request() req: any) {
        return req.user;
    }

}
