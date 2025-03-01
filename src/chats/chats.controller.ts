import { Controller, Get, HttpCode, HttpStatus, Param, Request, UseGuards } from '@nestjs/common';
import { UsersJwtPayloadDto } from 'src/auth/dto/users.jwt-payload.dto';
import { ChatsService } from './chats.service';
import { ChatsRetrieveDto } from './dto/chats.retrieve.dto';
import { MessageDto } from 'src/messages/dto/messages.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('chats')
export class ChatsController {
    constructor(
        private readonly chatsService: ChatsService,
    ) { }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get("/")
    async retrieveChats(@Request() req: { user: UsersJwtPayloadDto }): Promise<ChatsRetrieveDto[]> {
        let userId = req.user.id;
        let chats = await this.chatsService.retieveChats(userId);
        let chatResp: ChatsRetrieveDto[] = [];
        for (let chat of chats) {
            let user2 = (userId === chat.user1.id) ? chat.user2 : chat.user1;
            let messages: MessageDto[] = chat.messages.map((msg) => {
                return {
                    id: msg.id,
                    content: msg.content,
                    senderUsername: msg.sender.username,
                }
            })
            let isRequestedUser = await this.chatsService.isRequestedUser(userId, user2.id);
            chatResp.push({
                id: chat.id,
                name: user2.username,
                isPending: chat.isPending,
                isRequestedUser,
                lastMessage: messages[messages.length - 1],
                messages: messages,
            });
        }
        return chatResp;
    }

    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get("/:chatId")
    async getChatMessages(@Request() req: { user: UsersJwtPayloadDto }, @Param("chatId") chatId: string): Promise<ChatsRetrieveDto> {
        let userId = req.user.id;
        let chat = await this.chatsService.getChat(userId, chatId);
        let user2 = (userId === chat.user1.id) ? chat.user2 : chat.user1;
        let messages: MessageDto[] = chat.messages.map((msg) => {
            return {
                id: msg.id,
                content: msg.content,
                senderUsername: msg.sender.username,
            }

        })
        return {
            id: chat.id,
            name: user2.username,
            isPending: chat.isPending,
            isRequestedUser: await this.chatsService.isRequestedUser(userId, user2.id),
            lastMessage: messages[messages.length - 1],
            messages: messages,
        }
    }
}
