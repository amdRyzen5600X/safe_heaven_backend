import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Chats } from './chats.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/users.entity';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(Chats)
        private readonly chatRepo: Repository<Chats>,
    ) { }

    async createChat(user1: Users, user2: Users): Promise<Chats> {
        let chat = await this.chatRepo.save({user1: user1, user2: user2});
        return chat;
    }

    async retieveChats(userId: string): Promise<Chats[]> {
        let chats = await this.chatRepo.find({ relations: { messages: true, user1: true, user2: true } });
        return chats.filter((chat) => {
            return (chat.user1.id === userId || chat.user2.id === userId);
        });

    }

    async getChat(userId: string, chatId: string): Promise<Chats> {
        let chat = await this.chatRepo.findOne({ where: { id: chatId }, relations: { messages: true } });
        if (!chat) {
            throw new NotFoundException({ message: "chat not found" });
        }
        if (chat.user1.id !== userId && chat.user2.id !== userId) {
            throw new UnauthorizedException({ message: "don't have permission to see that chat" });
        }
        return chat;
    }
}
