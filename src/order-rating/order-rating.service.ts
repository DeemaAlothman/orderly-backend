import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderRatingDto } from './dto/create-order-rating.dto';
import { OrderStatus } from '@prisma/client';
@Injectable()
export class OrderRatingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderRatingDto, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) throw new NotFoundException('الطلب غير موجود');
    if (order.customerId !== customerId)
      throw new ForbiddenException('لا يمكنك تقييم طلب لا تملكه');
    if (order.order_status !== OrderStatus.DELIVERED)
      throw new BadRequestException('يمكنك تقييم الطلب فقط بعد التسليم');

    const existingRating = await this.prisma.orderRating.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existingRating)
      throw new BadRequestException('تم تقييم هذا الطلب مسبقاً');

    return this.prisma.orderRating.create({
      data: {
        orderId: dto.orderId,
        customerId,
        rating_score: dto.rating_score,
        review_text: dto.review_text,
      },
    });
  }

  async findByOrder(orderId: string) {
    return this.prisma.orderRating.findUnique({
      where: { orderId },
    });
  }
}
