import { OnModuleInit, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ChatsService } from 'src/chats/chats.service';
import { MessagesSendDto } from 'src/chats/dto/messages.send.dto';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway()
export class ConversationGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    constructor(
        private readonly usersService: UsersService,
        private readonly chatService: ChatsService,
        private readonly authService: AuthService,
        private readonly messagesService: MessagesService
    ) { }

    @WebSocketServer()
    server: Server;

    async onModuleInit() {
        await this.usersService.deleteAllConnections();
    }

    async handleConnection(socket: Socket) {
        try {
            let token = await this.authService.verify(socket.handshake.headers.authorization);
            let user = await this.usersService.findById(token.id);
            if (!user) {
                return this.disconnect(socket);
            }
            socket.data.user = user;
            await this.usersService.establishConnection(user.id, socket.id);
        } catch {
            return this.disconnect(socket);
        }
    }

    async handleDisconnect(socket: Socket) {
        await this.usersService.deleteConnectionBySocketId(socket.id);
        socket.disconnect();
    }

    private disconnect(socket: Socket) {
        socket.emit("Error", new UnauthorizedException());
        socket.disconnect();
    }

    @SubscribeMessage("sendMessage")
    async onSendMessage(socket: Socket, message: MessagesSendDto) {
        let chat = await this.chatService.getChat(socket.data.user.id, message.chatId);
        let msg = await this.messagesService.sendMessage(socket.data.user, message.content, chat);
        let user2 = chat.user1.id === socket.data.user.id ? chat.user2 : chat.user1;
        if (user2.socketId) {
            this.server.to(user2.socketId).emit("newMessage", {id: msg.id, content: msg.content, senderUsername: msg.sender.username});
        }
    }

}
