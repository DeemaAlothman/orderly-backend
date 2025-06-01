// src/delivery-staff/delivery-staff.module.ts
import { Module } from '@nestjs/common';
import { DeliveryStaffService } from './delivery-staff.service';
import { DeliveryStaffController } from './delivery-staff.controller';

@Module({
  controllers: [DeliveryStaffController],
  providers: [DeliveryStaffService],
})
export class DeliveryStaffModule {}
