import { Module } from '@nestjs/common';
import { ConversationGateway } from './conversation.gateway';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatsModule } from 'src/chats/chats.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
    imports: [
        UsersModule,
        AuthModule,
        ChatsModule,
        MessagesModule,
    ],
    providers: [ConversationGateway],
})
export class ConversationModule { }
