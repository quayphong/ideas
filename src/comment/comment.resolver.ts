import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CommentDTO } from "./comment.dto";
import { CommentService } from "./comment.service";

@Resolver('comment')
export class CommentResolver{
    constructor(private commentService: CommentService){}

    @Query()
    async comment(@Args('id') id: string){
        return await this.commentService.show(id);
    }

    @Mutation()
    async createComment(@Args('idea') ideaId: string, @Args('comment') comment: string, @Context('user') user){
        const data: CommentDTO = {comment};
        const {id: userId} = user;
        return await this.commentService.create(ideaId, userId, data);
    }

    @Mutation()
    async deleteComment(@Args('id') id: string, @Context('user') user){
        const {id: userId} = user;
        return await this.commentService.destroy(id, userId);
    }
}