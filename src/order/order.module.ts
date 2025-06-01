// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { NotificationModule } from '../notification/notification.module';
@Module({
  imports: [NotificationModule ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
