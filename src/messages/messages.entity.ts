import { Chats } from "src/chats/chats.entity";
import { Users } from "src/users/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Messages {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    content: string;

    @ManyToOne(() => Users, {eager: true})
    @JoinColumn({name: "senderId"})
    sender: Users;

    @ManyToOne(() => Chats, {eager: true})
    @JoinColumn({name: "chatId"})
    chat: Chats;

    @CreateDateColumn()
    createdAt: Date;
}
