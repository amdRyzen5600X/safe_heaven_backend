import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Chats } from 'src/chats/chats.entity';
import { Users } from 'src/users/users.entity';
import { Messages } from './messages.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Messages)
        private readonly messagesRepo: Repository<Messages>
    ) { }

    async sendMessage(sender: Users, content: string, chat: Chats): Promise<Messages> {
        if (chat.user1.id !== sender.id && chat.user2.id !== sender.id) {
            throw new UnauthorizedException();
        }
        let message = new Messages(sender, chat, content);
        return await this.messagesRepo.save(message)
    }
}
