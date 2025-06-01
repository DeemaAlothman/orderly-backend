// src/delivery-staff/delivery-staff.module.ts
import { Module } from '@nestjs/common';
import { DeliveryStaffService } from './delivery-staff.service';
import { DeliveryStaffController } from './delivery-staff.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliveryStaffGateway } from '../websockets/delivery-staff.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [DeliveryStaffController],
  providers: [DeliveryStaffService, PrismaService, DeliveryStaffGateway],
})
export class DeliveryStaffModule {}
