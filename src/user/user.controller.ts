import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { Public } from '../shared/public.decorator';

import { ValidationPipe } from '../shared/validation.pipe';
import { UserDTO } from './user.dto';
import { UserService } from './user.service';

@Controller()
export class UserController {

    constructor(private userService: UserService){

    }

    @Get('api/users')
    showAllUsers(@Query('page') page: number){
        return this.userService.showAll(page);
    }

    @Post('login')
    @Public()
    @UsePipes(new ValidationPipe())
    login(@Body() data: UserDTO){
        return this.userService.login(data);
    }

    @Post('register')
    @Public()
    @UsePipes(new ValidationPipe())
    register(@Body() data: UserDTO){
        return this.userService.register(data);
    }
}
