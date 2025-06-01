// src/order/order.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  Request,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() dto: CreateOrderDto) {
    if (req.user.type !== UserType.CUSTOMER) {
      throw new ForbiddenException('فقط العملاء يمكنهم إنشاء الطلبات');
    }

    return this.orderService.create(dto, req.user.id);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @Patch(':id/assign-staff')
  async assignStaff(
    @Param('id') orderId: string,
    @Body('staffId') staffId: string,
  ) {
    const staff = await this.prisma.deliveryStaff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      throw new NotFoundException('عامل التوصيل غير موجود');
    }

    if (staff.availability_status !== 'متاح') {
      throw new ForbiddenException('عامل التوصيل غير متاح حالياً');
    }

    await this.prisma.deliveryStaff.update({
      where: { id: staffId },
      data: { availability_status: 'مشغول' },
    });

    return this.orderService.update(orderId, { staffId });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/delivery-status')
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body('order_status') newStatus: string,
    @Request() req,
  ) {
    // خريطة التحويل من الحالة العربية إلى القيم المتوافقة مع الـ enum الخاص بالطلب
    const statusMap = {
      'في الطريق': 'ASSIGNED',
      'تم التوصيل': 'DELIVERED',
    };

    if (req.user.type !== UserType.DELIVERY_STAFF) {
      throw new ForbiddenException('فقط عامل التوصيل يمكنه تعديل حالة التوصيل');
    }

    const order = await this.orderService.findOne(id);
    if (!order) throw new NotFoundException('الطلب غير موجود');

    if (order.staffId !== req.user.id) {
      throw new ForbiddenException('لا تملك صلاحية على هذا الطلب');
    }

    const mappedStatus = statusMap[newStatus];
    if (!mappedStatus) {
      throw new ForbiddenException('الحالة غير مصرح بها');
    }

    // هنا تمرر القيمة من الـ enum وليس النص العربي
    return this.orderService.update(id, { order_status: mappedStatus });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const order = await this.orderService.findOne(id);
    if (!order) throw new NotFoundException('الطلب غير موجود');

    if (
      req.user.type === UserType.ADMIN ||
      (req.user.type === UserType.CUSTOMER &&
        order.customerId === req.user.id &&
        ['جديد', 'قيد الانتظار'].includes(order.order_status))
    ) {
      return this.orderService.remove(id);
    }

    throw new ForbiddenException('لا تملك صلاحية حذف هذا الطلب');
  }
}
