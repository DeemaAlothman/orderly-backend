// src/delivery-staff/delivery-staff.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryStaffDto } from './dto/create-delivery-staff.dto';
import { UpdateDeliveryStaffDto } from './dto/update-delivery-staff.dto';
import * as bcrypt from 'bcrypt';
import { UserType } from '../common/enums/user-type.enum';

@Injectable()
export class DeliveryStaffService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDeliveryStaffDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        password: hashedPassword,
        address: data.address,
        type: UserType.DELIVERY_STAFF,
      },
    });

    const deliveryStaff = await this.prisma.deliveryStaff.create({
      data: {
        userId: user.id,
        vehicle_type: data.vehicle_type,
        availability_status: data.availability_status,
      },
    });

    return { user, deliveryStaff };
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
}
