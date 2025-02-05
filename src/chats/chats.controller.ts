import { Controller, Get, HttpCode, HttpStatus, Param, Request } from '@nestjs/common';
import { Chats } from './chats.entity';
import { UsersJwtPayloadDto } from 'src/auth/dto/users.jwt-payload.dto';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
    constructor(private readonly chatsService: ChatsService) { }

    @HttpCode(HttpStatus.OK)
    @Get("/")
    retrieveChats(@Request() req: UsersJwtPayloadDto): Promise<Chats[]> {
        let userId = req.id;
        return this.chatsService.retieveChats(userId);
    }

    @HttpCode(HttpStatus.OK)
    @Get("/:chatId")
    getChatMessages(@Request() req: UsersJwtPayloadDto, @Param("chatId") chatId: string): Promise<Chats> {
        return this.chatsService.getChat(req.id, chatId);
    }
}
