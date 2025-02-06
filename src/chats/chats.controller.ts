import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Request } from '@nestjs/common';
import { UsersJwtPayloadDto } from 'src/auth/dto/users.jwt-payload.dto';
import { ChatsService } from './chats.service';
import { ChatsRetrieveDto } from './dto/chats.retrieve.dto';
import { MessageDto } from 'src/messages/dto/messages.dto';
import { MessagesService } from 'src/messages/messages.service';
import { MessagesSendDto } from './dto/messages.send.dto';

@Controller('chats')
export class ChatsController {
    constructor(
        private readonly chatsService: ChatsService,
        private readonly messagesService: MessagesService,
    ) { }

    @HttpCode(HttpStatus.OK)
    @Get("/")
    async retrieveChats(@Request() req: { user: UsersJwtPayloadDto }): Promise<ChatsRetrieveDto[]> {
        let userId = req.user.id;
        let chats = await this.chatsService.retieveChats(userId);
        return chats.map((chat) => {
            let name = (userId === chat.user1.id) ? chat.user2.username : chat.user1.username;
            let messages: MessageDto[] = chat.messages.map((msg) => {
                return {
                    id: msg.id,
                    content: msg.content,
                    senderUsername: msg.sender.username,
                }
            })
            return {
                id: chat.id,
                name: name,
                lastMessage: messages[messages.length - 1],
                messages: messages,
            }
        });
    }

    @HttpCode(HttpStatus.OK)
    @Get("/:chatId")
    async getChatMessages(@Request() req: { user: UsersJwtPayloadDto }, @Param("chatId") chatId: string): Promise<ChatsRetrieveDto> {
        let userId = req.user.id;
        let chat = await this.chatsService.getChat(userId, chatId);
        let name = (userId === chat.user1.id) ? chat.user1.username : chat.user2.username;
        let messages: MessageDto[] = chat.messages.map((msg) => {
            return {
                id: msg.id,
                content: msg.content,
                senderUsername: msg.sender.username,
            }

        })
        return {
            id: chat.id,
            name: name,
            lastMessage: messages[messages.length - 1],
            messages: messages,
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post("/:chatId")
    async sendMessage(@Request() req: { user: UsersJwtPayloadDto }, @Param("chatId") chatId: string, @Body() msg: MessagesSendDto): Promise<MessageDto> {
        let userId = req.user.id;
        let chat = await this.chatsService.getChat(userId, chatId);
        let sender = (userId === chat.user1.id) ? chat.user1 : chat.user2;
        let message = await this.messagesService.sendMessage(sender, msg.content, chat);
        return {
            id: message.id,
            content: message.content,
            senderUsername: message.sender.username,
        }
    }

}
