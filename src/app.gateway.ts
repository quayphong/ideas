import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'

@WebSocketGateway(4001,
    {
        cors: 
        {
            origin: '*', 
            methods:'*',
            credentials: false,
        }
    })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer()
    wss;

    private logger = new Logger('AppGateway')

    handleConnection(client: any, ...args: any[]) {
        this.logger.log('New client connected');
        client.emit('connection', 'Successfully connected to server');
    }

    handleDisconnect(client: any) {
        this.logger.log('Client disconnected ');
    }
}