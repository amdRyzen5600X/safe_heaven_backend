import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Users {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index()
    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    socketId?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
        this.socketId = undefined;
    }
}
