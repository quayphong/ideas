import { UserEntity } from '../user/user.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CommentEntity } from '../comment/comment.entity';

@Entity('idea')
export class IdeaEntity{
    @PrimaryGeneratedColumn('uuid') id: string;

    @CreateDateColumn() created: Date;

    @UpdateDateColumn() updated: Date;

    @Column('text') idea: string;

    @Column('text') description: string;

    @ManyToOne(() => UserEntity, author => author.ideas)
    author: UserEntity;

    @ManyToMany(() => UserEntity, {cascade: true})
    @JoinTable()
    upvotes: UserEntity[];

    @ManyToMany(() => UserEntity, {cascade: true})
    @JoinTable()
    downvotes: UserEntity[];

    @OneToMany(() => CommentEntity, comment => comment.idea, {cascade: true})
    comments: CommentEntity[];
}