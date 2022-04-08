import { IdeaEntity } from "../idea/idea.entity";
import { UserEntity } from "../user/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('comment')
export class CommentEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    created: Date;

    @Column('text')
    comment: string;

    @ManyToOne(() => UserEntity)
    @JoinTable()
    author: UserEntity;

    @ManyToOne(() => IdeaEntity, idea => idea.comments)
    idea: IdeaEntity;
}