import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Messages } from './messages.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Messages]),
    ],
    providers: [MessagesService],
    exports: [MessagesService],
})
export class MessagesModule { }
