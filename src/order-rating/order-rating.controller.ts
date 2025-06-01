import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { OrderRatingService } from './order-rating.service';
import { CreateOrderRatingDto } from './dto/create-order-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('order-rating')
export class OrderRatingController {
  constructor(private readonly orderRatingService: OrderRatingService) {}

  @Post()
  async create(@Body() dto: CreateOrderRatingDto, @Request() req: any) {
    return this.orderRatingService.create(dto, req.user.id);
  }

  @Get(':orderId')
  async getRating(@Param('orderId') orderId: string) {
    return this.orderRatingService.findByOrder(orderId);
  }
}
