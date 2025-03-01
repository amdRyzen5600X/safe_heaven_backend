import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { Users } from './users/users.entity';
import { Chats, UsersToKeysTmp } from './chats/chats.entity';
import { Messages } from './messages/messages.entity';
import { MessagesModule } from './messages/messages.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConversationModule } from './conversation/conversation.module';

@Module({
    imports: [
        ConfigModule.forRoot(
            { envFilePath: "./.env" }
        ),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get("POSTGRES_HOST"),
                port: parseInt(configService.get("POSTGRES_PORT") ?? "5432"),
                username: configService.get("POSTGRES_USER"),
                password: configService.get("POSTGRES_PASSWORD"),
                database: configService.get("POSTGRES_DB"),
                entities: [Users, Chats, Messages, UsersToKeysTmp],
                synchronize: true, //remove on prod
            }),
        }),
        UsersModule,
        AuthModule,
        ChatsModule,
        MessagesModule,
        ConversationModule
    ],
    controllers: [AppController],
    providers: [AppService,],
})
export class AppModule { }
