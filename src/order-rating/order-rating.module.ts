import { Module } from '@nestjs/common';
import { OrderRatingService } from './order-rating.service';
import { OrderRatingController } from './order-rating.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [OrderRatingController],
  providers: [OrderRatingService, PrismaService],
})
export class OrderRatingModule {}
