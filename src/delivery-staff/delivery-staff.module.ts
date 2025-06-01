// src/delivery-staff/delivery-staff.module.ts
import { Module } from '@nestjs/common';
import { DeliveryStaffService } from './delivery-staff.service';
import { DeliveryStaffController } from './delivery-staff.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [AuthModule], // إضافة AuthModule للوصول إلى AuthService
  controllers: [DeliveryStaffController],
  providers: [DeliveryStaffService, PrismaService],
})
export class DeliveryStaffModule {}
