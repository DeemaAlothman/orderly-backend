// src/delivery-type/delivery-type.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeliveryTypeDto } from './dto/create-delivery-type.dto';
import { UpdateDeliveryTypeDto } from './dto/update-delivery-type.dto';

@Injectable()
export class DeliveryTypeService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateDeliveryTypeDto) {
    return this.prisma.deliveryType.create({ data: dto });
  }

  findAll() {
    return this.prisma.deliveryType.findMany();
  }

  findOne(id: string) {
    return this.prisma.deliveryType.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateDeliveryTypeDto) {
    return this.prisma.deliveryType.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.deliveryType.delete({ where: { id } });
  }
}
