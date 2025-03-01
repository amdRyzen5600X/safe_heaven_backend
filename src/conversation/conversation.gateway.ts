import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ChatsService } from 'src/chats/chats.service';
import { MessagesSendDto } from 'src/chats/dto/messages.send.dto';
import { MessagesService } from 'src/messages/messages.service';
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
        this.server.to(socket.id).emit(`newMessage_${chat.id}`, { id: msg.id, content: msg.content, senderUsername: msg.sender.username });
        let user2 = chat.user1.id === socket.data.user.id ? chat.user2 : chat.user1;
        if (user2.socketId) {
            this.server.to(user2.socketId).emit(`newMessage_${chat.id}`, { id: msg.id, content: msg.content, senderUsername: msg.sender.username });
        }
    }

    @SubscribeMessage("createChat")
    async createChat(socket: Socket, user2req: { username: string }) {
        console.log("creating new chat...");
        let user2 = await this.usersService.findByUsername(user2req.username);
        if (user2 === null) {
            throw new WsException({ message: "user not found" });
        }
        let chat = await this.chatService.createChat(socket.data.user, user2);
        let [publicKey, privateKey] = this.chatService.generateChatKeys();
        let chatDtoToUser1 = {
            id: chat.id,
            name: chat.user2.username,
            isPending: true,
            isRequestedUser: true,
            publicKey,
            privateKey,
        }
        this.server.to(socket.id).emit("newChat", chatDtoToUser1);
        await this.chatService.saveChatKeys(user2, socket.data.user, publicKey, privateKey);
        if (user2.socketId !== undefined) {
            let chatDtoToUser2 = {
                id: chat.id,
                name: chat.user1.username,
                isPending: true,
                isRequestedUser: false,
            }
            this.server.to(user2.socketId).emit("newChat", chatDtoToUser2);
        }
        console.log("created chat!");
    }

    @SubscribeMessage("confirm")
    async confirmChat(socket: Socket, chat2start: { chatId: string }) {
        console.log("confirming to start chat...");
        let chat = await this.chatService.getChat(socket.data.user.id, chat2start.chatId);
        let user2 = chat.user1.id === socket.data.user.id ? chat.user2 : chat.user1;

        await this.chatService.confirmChat(chat2start.chatId);
        let keys = await this.chatService.getChatKeys(socket.data.user.id, user2.id);
        if (keys === null) {
            console.log({ message: `there is no available keys for user: ${socket.data.user.id}` });
            throw new WsException({ message: `there is no available keys for user: ${socket.data.user.id}` });
        }
        this.server.to(socket.id).emit("chatStatus", { confirmed: true, chatId: chat2start.chatId, publicKey: keys.publicKey, privateKey: keys.privateKey })
        if (user2.socketId !== undefined) {
            this.server.to(user2.socketId).emit("chatStatus", { confirmed: true, chatId: chat2start.chatId })
        }
        console.log("confirmed to start chat");
    }

    @SubscribeMessage("decline")
    async declineChat(socket: Socket, chat2delete: { chatId: string }) {
        let chat = await this.chatService.getChat(socket.data.user.id, chat2delete.chatId);
        let user2 = chat.user1.id === socket.data.user.id ? chat.user2 : chat.user1;

        await this.chatService.declineChat(chat2delete.chatId);
        this.server.to(socket.id).emit("chatStatus", { confirmed: false, chatId: chat2delete.chatId })
        if (user2.socketId !== undefined) {
            this.server.to(user2.socketId).emit("chatStatus", { confirmed: false, chatId: chat2delete.chatId })
        }
    }
}
