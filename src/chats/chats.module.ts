import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chats } from './chats.entity';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Chats]),
        MessagesModule,
    ],
    controllers: [ChatsController],
    providers: [ChatsService]
})
export class ChatsModule { }
