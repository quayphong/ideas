import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
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
    if(!request)
    {
      return true;
    }

    if(!request.headers.authorization){
      return false;
    }

    request.user = this.validateToken(request.headers.authorization);
    
    return true;
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