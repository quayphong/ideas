import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector){
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean>{

    const isPublic = this.reflector.get<boolean>("isPublic", context.getHandler());
    if(isPublic){
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // GraphQL 
    if(request){
      if(!request.headers.authorization){
        return false;
      }

      request.user = this.validateToken(request.headers.authorization);
      return true;
    } else {
      const whitelist: string[] = ['login'];
      const ctx: any = GqlExecutionContext.create(context);
      const reqs = ctx.args[2];
      const info = ctx.args[3];

      if(whitelist.indexOf(info.fieldName) > -1)
        return true;

      if(!reqs.req.headers.authorization){
        return false;
      }
      ctx.args[2].user = this.validateToken(reqs.req.headers.authorization);
      return true;
    }
  }

  validateToken(auth: string){
      if(auth.split(' ')[0] !== 'Bearer'){
          throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
      }

      const token = auth.split(' ')[1];
      try{
          const decoded = jwt.verify(token, process.env.SECRET);
          return decoded;
      } catch(err){
          const message = 'Token error: ' + (err.message || err.name)
          throw new HttpException(message, HttpStatus.FORBIDDEN);
      }
  }
}