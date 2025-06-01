// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { DeliveryStaffModule } from './delivery-staff/delivery-staff.module';
import { DeliveryTypeModule } from './delivery-type/delivery-type.module';
import { OrderModule } from './order/order.module';
import { UserAddressModule } from './user-address/user-address.module';
import { OrderRatingModule } from './order-rating/order-rating.module';
import { PricingConfigModule } from './pricing-config/pricing-config.module';
import { DeviceTokenModule } from './device-token/device-token.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // لقراءة .env تلقائيًا
    PrismaModule,
    UserModule,
    AuthModule,
    DeliveryStaffModule,
    DeliveryTypeModule,
    CategoryModule,
    OrderModule,
    UserAddressModule,
    OrderRatingModule,
    PricingConfigModule,
    DeviceTokenModule,
  ],
})
export class AppModule {}
