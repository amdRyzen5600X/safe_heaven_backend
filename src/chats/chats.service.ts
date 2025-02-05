import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Chats } from './chats.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(Chats)
        private readonly chatRepo: Repository<Chats>
    ) { }

    retieveChats(userId: string): Promise<Chats[]> {
        return this.chatRepo
            .createQueryBuilder("chats")
            .leftJoinAndSelect("chats.user1", "user1")
            .leftJoinAndSelect("chats.user2", "user2")
            .where("chats.user1.id = :userId OR chat.user2 = userId", { userId })
            .getMany()
    }

    async getChat(userId: string, chatId: string): Promise<Chats> {
        let chat = await this.chatRepo.findOne({ where: { id: chatId } });
        if (!chat) {
            throw new NotFoundException({message: "chat not found"});
        }
        if (chat.user1.id !== userId && chat.user2.id !== userId) {
            throw new UnauthorizedException({message: "don't have permission to see that chat"});
        }
        return chat;
    }
}
