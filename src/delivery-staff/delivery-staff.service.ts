// src/delivery-staff/delivery-staff.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeliveryStaffDto } from './dto/create-delivery-staff.dto';
import { UpdateDeliveryStaffDto } from './dto/update-delivery-staff.dto';
import { AuthService } from '../auth/auth.service';
import { UserType } from '@prisma/client';

@Injectable()
export class DeliveryStaffService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(data: CreateDeliveryStaffDto) {
    const createUserDto = {
      name: data.name,
      phone: data.phone,
      password: data.password,
      address: data.address,
      type: UserType.DELIVERY_STAFF,
    };

    const authResult = await this.authService.register(createUserDto);

    const user = await this.prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (!user) {
      throw new BadRequestException('فشل إنشاء المستخدم');
    }

    const deliveryStaff = await this.prisma.deliveryStaff.create({
      data: {
        userId: user.id,
        vehicle_type: data.vehicle_type,
        availability_status: data.availability_status,
      },
    });

    return {
      message: authResult.message,
      otp: authResult.otp, // For testing only
      deliveryStaff,
    };
  }

  async update(id: string, data: UpdateDeliveryStaffDto) {
    const deliveryStaff = await this.prisma.deliveryStaff.update({
      where: { id },
      data,
    });
    return deliveryStaff;
  }

  async findAll() {
    return this.prisma.deliveryStaff.findMany({
      include: { user: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.deliveryStaff.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async updateLocation(id: string, lat: number, long: number) {
    const deliveryStaff = await this.prisma.deliveryStaff.findUnique({
      where: { id },
    });

    if (!deliveryStaff) {
      throw new NotFoundException('موظف التوصيل غير موجود');
    }

    return this.prisma.deliveryStaff.update({
      where: { id },
      data: { lat, long },
    });
  }
}
