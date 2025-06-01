import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';

@Injectable()
export class UserAddressService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateUserAddressDto) {
    return this.prisma.userAddress.create({ data: dto });
  }

  findAll() {
    return this.prisma.userAddress.findMany();
  }

  findOne(id: string) {
    return this.prisma.userAddress.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateUserAddressDto) {
    return this.prisma.userAddress.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.userAddress.delete({ where: { id } });
  }
}
