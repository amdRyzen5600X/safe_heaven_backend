import { Messages } from "src/messages/messages.entity";
import { Users } from "src/users/users.entity";
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Chats {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Users, { eager: true })
    @JoinColumn({ name: "user1Id" })
    user1: Users;

    @ManyToOne(() => Users, { eager: true })
    @JoinColumn({ name: "user2Id" })
    user2: Users;

    @OneToMany(() => Messages, (message) => message.chat)
    messages: Messages[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
