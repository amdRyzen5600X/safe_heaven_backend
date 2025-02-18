import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ChatsService } from 'src/chats/chats.service';
import { MessagesSendDto } from 'src/chats/dto/messages.send.dto';
import { MessagesService } from 'src/messages/messages.service';
import { Users } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({
    cors: {
        origin: true,
        credentials: true,
    }
})
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
            console.log(`connection ${socket.data}`)
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
        this.server.to(socket.id).emit("newMessage", { id: msg.id, content: msg.content, senderUsername: msg.sender.username });
        let user2 = chat.user1.id === socket.data.user.id ? chat.user2 : chat.user1;
        if (user2.socketId) {
            this.server.to(user2.socketId).emit("newMessage", { id: msg.id, content: msg.content, senderUsername: msg.sender.username });
        }
    }

    @SubscribeMessage("createChat")
    async createChat(socket: Socket, user2req: { userId: string }) {
        let user2 = await this.usersService.findById(user2req.userId);
        if (user2 === null) {
            throw new WsException({ message: "user not found" });
        }
        let chat = await this.chatService.createChat(socket.data.user, user2);
        let lastMessage = chat.messages[chat.messages.length - 1];
        let chatDtoToUser1 = {
            id: chat.id,
            name: chat.user2.username,
            lastMessage: {
                id: lastMessage.id,
                content: lastMessage.content,
                senderUsername: lastMessage.sender.username,
            }
        }
        let chatDtoToUser2 = {
            id: chat.id,
            name: chat.user1.username,
            lastMessage: {
                id: lastMessage.id,
                content: lastMessage.content,
                senderUsername: lastMessage.sender.username,
            }
        }
        this.server.to(socket.id).emit("newChat", chatDtoToUser1);
        if (user2.socketId !== undefined) {
            this.server.to(user2.socketId).emit("newChat", chatDtoToUser2);
        }
    }

}
