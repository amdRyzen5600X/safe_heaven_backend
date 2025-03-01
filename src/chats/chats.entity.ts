import { Messages } from "src/messages/messages.entity";
import { Users } from "src/users/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({ nullable: true })
    isPending: boolean;

    @OneToMany(() => Messages, (message) => message.chat)
    messages: Messages[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

@Entity()
export class UsersToKeysTmp {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Users)
    @JoinColumn({ name: "userId" })
    user: Users;

    @Column()
    publicKey: string;

    @Column()
    privateKey: string;

    @ManyToOne(() => Users)
    @JoinColumn({ name: "requestedUserId" })
    requestedUser: Users;
}
