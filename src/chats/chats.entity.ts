import { Messages } from "src/messages/messages.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Chats {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    user1Id: string;

    @Column()
    user2Id: string;

    @OneToMany(() => Messages, (message) => message.chat)
    messages: Messages[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
