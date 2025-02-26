import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { UsersInfoDto } from './dto/users.info.dto';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }


    @HttpCode(HttpStatus.OK)
    @Get("/:userId")
    async getById(@Param("userId") userId: string): Promise<UsersInfoDto> {
        let user = await this.usersService.findById(userId);
        if (!user) {
            throw new NotFoundException();
        }
        return {
            id: user.id,
            username: user.username,
        }
    }
}
