import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Chats, UsersToKeysTmp } from './chats.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/users.entity';
import NodeRSA from 'encrypt-rsa';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(Chats)
        private readonly chatRepo: Repository<Chats>,

        @InjectRepository(UsersToKeysTmp)
        private readonly usersToKeysTmp: Repository<UsersToKeysTmp>,

    ) { }

    async createChat(user1: Users, user2: Users): Promise<Chats> {
        let chat = await this.chatRepo.save({ user1: user1, user2: user2, isPending: true });
        return chat;
    }

    generateChatKeys(): [string, string] {
        let nodeRsa = new NodeRSA();
        let { publicKey, privateKey } = nodeRsa.createPrivateAndPublicKeys();
        return [publicKey, privateKey];
    }

    async isRequestedUser(user1Id: string, user2Id: string): Promise<boolean> {
        let requestedUser = await this.usersToKeysTmp.query('select id from users_to_keys_tmp where "userId"=$1 and "requestedUserId"=$2', [user1Id, user2Id]);
        if (requestedUser[0] === undefined) {
            return false;
        }
        return true;
    }

    async saveChatKeys(user: Users, requestedUser: Users, publicKey: string, privateKey: string) {
        await this.usersToKeysTmp.save({
            user,
            publicKey,
            privateKey,
            requestedUser,
        });
    }

    async getChatKeys(userId: string, requestedUserId: string): Promise<UsersToKeysTmp | null> {
        let keys: UsersToKeysTmp[] = await this.usersToKeysTmp.query('select id, "userId", "publicKey", "privateKey", "requestedUserId" from users_to_keys_tmp where "userId"=$1 and "requestedUserId"=$2', [userId, requestedUserId]);
        if (keys[0] === null) {
            return null;
        }
        await this.usersToKeysTmp.delete({ id: keys[0].id });
        return keys[0];
    }

    async confirmChat(chatId: string) {
        await this.chatRepo.update({ id: chatId }, { isPending: false });
    }

    async declineChat(chatId: string) {
        await this.chatRepo.delete({ id: chatId });
    }

    async retieveChats(userId: string): Promise<Chats[]> {
        let chats = await this.chatRepo.find({ relations: { messages: true, user1: true, user2: true } });
        return chats.filter((chat) => {
            return (chat.user1.id === userId || chat.user2.id === userId);
        });

    }

    async getChat(userId: string, chatId: string): Promise<Chats> {
        let chat = await this.chatRepo.findOne({ where: { id: chatId }, relations: { user1: true, user2: true, messages: true } });
        if (!chat) {
            throw new NotFoundException({ message: "chat not found" });
        }
        if (chat.user1.id !== userId && chat.user2.id !== userId) {
            throw new UnauthorizedException({ message: "don't have permission to see that chat" });
        }
        return chat;
    }
}
