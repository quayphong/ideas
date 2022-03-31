import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'

import { Request, Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter{
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse = {
            code: status,
            timestamp: new Date().toLocaleDateString(),
            path: request.url,
            method: request.headers.method,
            message: (status !== HttpStatus.INTERNAL_SERVER_ERROR) ? (exception.message || null) : 'Internal server error'
        };

        if(status === HttpStatus.INTERNAL_SERVER_ERROR){
            console.error(exception);
        }

        Logger.error(
            request.method + ' ' + request.url,
            JSON.stringify(errorResponse),
            'ExceptionFilter'
        );

        response.status(status).json(errorResponse);
    }
}