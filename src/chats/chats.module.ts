import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chats } from './chats.entity';
import { MessagesModule } from 'src/messages/messages.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        TypeOrmModule.forFeature([Chats]),
        MessagesModule,
        ConfigModule.forRoot({ envFilePath: "./.env" }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                global: true,
                secret: configService.get("JWT_SECRET"),
                signOptions: { expiresIn: "30d" },
            }),
        })
    ],
    controllers: [ChatsController],
    providers: [ChatsService],
    exports: [ChatsService],

})
export class ChatsModule { }
