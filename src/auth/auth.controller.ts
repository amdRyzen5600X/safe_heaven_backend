import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersSignInDto } from './dto/users.sign_in.dto';
import { UsersJwtDto } from './dto/users.jwt.dto';
import { UsersSignUpDto } from './dto/users.sign_up.dto';
import { AuthGuard } from './auth.guard';
import { UsersRefreshDto } from './dto/user.refresh.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post("/sign-in")
    signIn(@Body() user: UsersSignInDto): Promise<UsersJwtDto> {
        return this.authService.signIn(user);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post("/sign-up")
    signUp(@Body() user: UsersSignUpDto): Promise<UsersJwtDto> {
        return this.authService.signUp(user);
    }

    @HttpCode(HttpStatus.CREATED)
    @Post("/refresh")
    refresh(@Body() refresh: UsersRefreshDto): Promise<UsersJwtDto> {
        return this.authService.refresh(refresh.refresh_token);
    }

    @UseGuards(AuthGuard)
    @Get("/refresh")
    profile(@Request() req: any) {
    }

}
