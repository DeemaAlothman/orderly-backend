import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-user-profile.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  // src/user/user.service.ts
  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existingUser) {
      console.error('❌ رقم الهاتف مستخدم:', dto.phone);
      throw new BadRequestException('رقم الهاتف مستخدم مسبقًا');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        id: uuidv4(), // تأكد من إنشاء UUID صالح
        name: dto.name,
        phone: dto.phone,
        password: hashedPassword,
        address: dto.address,
        type: dto.type || 'CUSTOMER',
        is_active: true,
        is_verified: false,
      },
    });
    console.log('✅ تم إنشاء مستخدم جديد:', { userId: user.id });
    return user;
  }
  async update(id: string, updateUserDto: UpdateUserDto | UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    if (dto.currentPassword && dto.newPassword) {
      const match = await bcrypt.compare(dto.currentPassword, user.password);
      if (!match) {
        throw new UnauthorizedException('كلمة المرور الحالية غير صحيحة');
      }

      dto['password'] = await bcrypt.hash(dto.newPassword, 10);
    }

    const {
      currentPassword,
      newPassword,
      confirmNewPassword,
      ...updateFields
    } = dto;

    return this.prisma.user.update({
      where: { id: userId },
      data: updateFields,
    });
  }
}
