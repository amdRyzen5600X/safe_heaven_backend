import * as bcrypt from "bcrypt";
import { Injectable } from '@nestjs/common';
import { Users } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private readonly userRepo: Repository<Users>
    ) { }

    findByUsername(username: string): Promise<Users | null> {
        return this.userRepo.findOne({ where: { username: username } });
    }

    async deleteAllConnections(): Promise<void> {
        this.userRepo.update({}, { socketId: undefined })
    }

    async deleteConnectionBySocketId(socketId: string) {
        this.userRepo.update({socketId}, {socketId: undefined});
    }

    async establishConnection(userId: string, socketId: string) {
        this.userRepo.update({id: userId}, {socketId});
    }

    findById(userId: string): Promise<Users | null> {
        return this.userRepo.findOne({ where: { id: userId } });
    }

    async createUser(username: string, password: string): Promise<Users> {
        let hashPassword = await bcrypt.hash(password, await bcrypt.genSalt());
        let user = new Users(username, hashPassword);
        return this.userRepo.save(user);
    }
}
