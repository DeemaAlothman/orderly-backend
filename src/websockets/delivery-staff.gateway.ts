// src/websockets/delivery-staff.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { DeliveryStaffService } from '../delivery-staff/delivery-staff.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001'], // استبدل بنطاق تطبيقك الأمامي
    credentials: true,
  },
})
export class DeliveryStaffGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly deliveryStaffService: DeliveryStaffService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.replace('Bearer ', '');
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
      await this.jwtService.verifyAsync(token);
      console.log('Client connected:', client.id);
    } catch (error) {
      console.error('Connection error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('updateLocation')
  async handleUpdateLocation(
    client: Socket,
    payload: { id: string; lat: number; long: number },
  ) {
    try {
      const token = client.handshake.auth.token?.replace('Bearer ', '');
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const decoded = await this.jwtService.verifyAsync(token);
      if (decoded.sub !== payload.id) {
        throw new UnauthorizedException(
          'Unauthorized access to this delivery staff',
        );
      }

      const deliveryStaff = await this.deliveryStaffService.updateLocation(
        payload.id,
        payload.lat,
        payload.long,
      );

      this.server.emit('locationUpdated', {
        id: payload.id,
        lat: payload.lat,
        long: payload.long,
      });

      return {
        status: 'success',
        message: 'تم تحديث الموقع بنجاح',
        deliveryStaff,
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
