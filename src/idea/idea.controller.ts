import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards, UsePipes } from '@nestjs/common';
import { User } from '../user/user.decorator';
import { ValidationPipe } from '../shared/validation.pipe';
import { IdeaDTO } from './idea.dto';

import { IdeaService } from './idea.service';

@Controller('api/ideas')
export class IdeaController {
    private logger = new Logger('IdeaController');
    constructor(private ideaService: IdeaService) {}

    private logData(options: any)
    {
        options.user && this.logger.log("USER " + JSON.stringify(options.user));
        options.data && this.logger.log("DATA " + JSON.stringify(options.data));
        options.id && this.logger.log("IDEA " + JSON.stringify(options.id));
    }

    @Get()
    showAllIdeas(){
        return this.ideaService.showAll();
    }

    @Post()
    @UsePipes(new ValidationPipe())
    createIdea(@User('id') user, @Body() data: IdeaDTO){
        this.logData({user, data});
        return this.ideaService.create(user.id, data);
    }

    @Get(':id')
    readIdea(@Param('id') id: string){
        return this.ideaService.read(id);
    }

    @Put(':id')
    @UsePipes(new ValidationPipe())
    updateIdea(@Param('id') id: string, @User('id') user, @Body() data: Partial<IdeaDTO>){
        this.logData({id, data, user});
        return this.ideaService.update(id, user.id, data);
    }

    @Delete(':id')
    destroyIdea(@Param('id') id: string, @User('id') user){
        this.logData({id, user});
        return this.ideaService.destroy(id, user.id);
    }

    @Post(':id/bookmark')
    bookmarkIdea(@Param('id') id: string, @User('id') user){
        this.logData({id, user});
        return this.ideaService.bookmark(id, user.id);
    }

    @Delete(':id/bookmark')
    unbookmarkIdea(@Param('id') id: string, @User('id') user){
        this.logData({id, user});    
        return this.ideaService.unbookmark(id, user.id);
    }

    @Post(':id/upvote')
    upvoteIdea(@Param('id') id: string, @User('id') user){
        this.logData({id, user});
        return this.ideaService.upvote(id, user.id);
    }

    @Delete(':id/downvote')
    downvoteIdea(@Param('id') id: string, @User('id') user){
        this.logData({id, user});    
        return this.ideaService.downvote(id, user.id);
    }
}
