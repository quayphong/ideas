import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import console from 'console';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean>{
    const request = context.switchToHttp().getRequest();
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