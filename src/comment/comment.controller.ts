import { Body, Controller, Delete, Get, Param, Post, Query, UsePipes } from '@nestjs/common';
import { User } from '../user/user.decorator';
import { ValidationPipe } from '../shared/validation.pipe';
import { CommentDTO } from './comment.dto';
import { CommentService } from './comment.service';

@Controller('api/comments')
export class CommentController {
    constructor(private commentService: CommentService){}

    @Get('idea/:id')
    showCommentsByIdea(@Param('id') ideaId: string, @Query('page') page: number){
        return this.commentService.showByIdea(ideaId, page);
    }

    @Get('user/:id')
    showCommentsByUser(@Param('id') userId: string, @Query('page') page: number){
        return this.commentService.showByUser(userId, page);
    }

    @Post('idea/:id')
    @UsePipes(new ValidationPipe())
    createComment(@Param('id') ideaId: string, @User('id') user, @Body() data: CommentDTO){
        return this.commentService.create(ideaId, user.id, data);
    }

    @Get(':id')
    showComment(@Param('id') id: string){
        return this.commentService.show(id);
    }

    @Delete(':id')
    destroyComment(@Param('id') id: string, @User('id') user){
        return this.commentService.destroy(id, user.id);
    }
}
