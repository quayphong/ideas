import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';

import { IdeaDTO, IdeaRO } from './idea.dto';
import { IdeaEntity } from './idea.entity';
import { Votes } from '../shared/votes.enum';
import { AppGateway } from '../app.gateway';

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity) 
        private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private gateway: AppGateway
        ){}
    
    private toResponseObject(idea: IdeaEntity): IdeaRO
    {
        var responseObject: any = {...idea, author: idea.author?.toResponseObject(false)};
        if(responseObject.upvotes){
            responseObject.upvotes = idea.upvotes.length;
        }
        if(responseObject.downvotes){
            responseObject.downvotes = idea.downvotes.length;
        }

        return responseObject;
    }

    private ensureOwnership(idea: IdeaEntity, userId: string){
        if(idea.author == null || idea.author.id !== userId){
            throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
        }
    }

    private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes){
        const opposite = vote === Votes.UP ? Votes.UP : Votes.DOWN;
        if(idea[opposite].filter(voter => voter.id === user.id).length > 0 ||
            idea[vote].filter(voter => voter.id === user.id).length > 0
        ){
            idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id);
            idea[vote] = idea[vote].filter(voter => voter.id !== user.id);
            await this.ideaRepository.save(idea);
        } else if(idea[vote].filter(voter => voter.id === user.id).length < 1){
            idea[vote].push(user);
            await this.ideaRepository.save(idea);
        } else {
            throw new  HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
        }

        return idea;
    }

    async showAll(page: number =1, newest?: boolean): Promise<IdeaRO[]> {
        const ideas =  await this.ideaRepository.find({
            relations: ['author','upvotes','downvotes','comments'],
            take: 25,
            skip: 25 * (page -1),
            order: newest && {created: 'DESC'}
        });
        return ideas.map(idea => this.toResponseObject(idea));
    }

    async create(userId: string, data: IdeaDTO): Promise<IdeaRO> {
        const user = await this.userRepository.findOne({where: {id: userId}});
        const idea = await this.ideaRepository.create({...data, author: user });
        await this.ideaRepository.save(idea);
        this.gateway.wss.emit('newIdea', idea);
        return this.toResponseObject(idea);
    }

    async read(id: string): Promise<IdeaRO> {
        const idea = await this.ideaRepository.findOne({where: {id}, relations: ['author','comments']});
        if(!idea){
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        return this.toResponseObject(idea);
    }

    async update(id: string, userId: string, data: Partial<IdeaDTO>): Promise<IdeaRO> {
        let idea = await this.ideaRepository.findOne({where: {id}, relations: ['author']});
        if(!idea){
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        this.ensureOwnership(idea, userId);
        await this.ideaRepository.update({id}, data);
        idea = await this.ideaRepository.findOne({where: {id}, relations: ['author','comments']});
        return this.toResponseObject(idea);
    }

    async destroy(id: string, userId: string){
        const idea = await this.ideaRepository.findOne({where: {id}, relations: ['author','comments']});
        if(!idea){
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        this.ensureOwnership(idea, userId);
        await this.ideaRepository.delete({id});
        return this.toResponseObject(idea);
    }

    async bookmark(id: string, userId: string){
        const idea = await this.ideaRepository.findOne({where: {id}});
        const user = await this.userRepository.findOne({where: {id: userId}, relations: ['bookmarks']});

        if(user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1){
            user.bookmarks.push(idea);
            await this.userRepository.save(user);
        }else{
            throw new HttpException('Idea already bookmarked', HttpStatus.BAD_REQUEST);
        }

        return user.toResponseObject();
    }

    async unbookmark(id: string, userId: string){
        const idea = await this.ideaRepository.findOne({where: {id}});
        const user = await this.userRepository.findOne({where: {id: userId}, relations: ['bookmarks']});

        if(user.bookmarks.filter(bookmark => bookmark.id === idea.id).length > 0){
            user.bookmarks = user.bookmarks.filter(bookmark => bookmark.id !== idea.id);
            await this.userRepository.save(user);
        }else{
            throw new HttpException('Idea already bookmarked', HttpStatus.BAD_REQUEST);
        }

        return user.toResponseObject();
    }

    async upvote(id: string, userId: string){
        let idea = await this.ideaRepository.findOne({where: {id}, relations:['author','upvotes', 'downvotes','comments']});
        const user = await this.userRepository.findOne({where: {id: userId}});
        idea = await this.vote(idea, user, Votes.UP);
        return this.toResponseObject(idea);
    }

    async downvote(id: string, userId: string){
        let idea = await this.ideaRepository.findOne({where: {id}, relations:['author','upvotes', 'downvotes','comments']});
        const user = await this.userRepository.findOne({where: {id: userId}});
        idea = await this.vote(idea, user, Votes.DOWN);
        return this.toResponseObject(idea);
    }
}
