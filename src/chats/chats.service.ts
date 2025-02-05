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

    async retieveChats(userId: string): Promise<Chats[]> {
        try {
            let chats = await this.chatRepo
                .createQueryBuilder("chats")
                .where("chats.user1Id = :userId OR chats.user2Id = :userId", { userId })
                .getMany();
            return chats;
        } catch {
            throw new NotFoundException();
        }
    }

    async getChat(userId: string, chatId: string): Promise<Chats> {
        let chat = await this.chatRepo.findOne({
            where: { id: chatId },
            relations: { messages: true }
        });
        if (!chat) {
            throw new NotFoundException({ message: "chat not found" });
        }
        if (chat.user1Id !== userId && chat.user2Id !== userId) {
            throw new UnauthorizedException({ message: "don't have permission to see that chat" });
        }
        return chat;
    }
}
