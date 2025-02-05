import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesService } from './messages/messages.service';
import { Users } from './users/users.entity';
import { Chats } from './chats/chats.entity';
import { Messages } from './messages/messages.entity';
import { MessagesModule } from './messages/messages.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.POSTGRES_HOST,
            port: parseInt(process.env.POSTGRES_PORT ?? "5432"),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [Users, Chats, Messages],
            synchronize: true, //remove on prod
        }),
        UsersModule,
        AuthModule,
        ChatsModule,
        MessagesModule
    ],
    controllers: [AppController],
    providers: [AppService, MessagesService],
})
export class AppModule { }
