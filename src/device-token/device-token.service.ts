import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeviceTokenService {
  constructor(private prisma: PrismaService) {}

  async saveOrUpdate(userId: string, token: string) {
    const existing = await this.prisma.deviceToken.findFirst({
      where: { userId },
    });

    if (existing) {
      return this.prisma.deviceToken.update({
        where: { id: existing.id },
        data: { token },
      });
    }

    return this.prisma.deviceToken.create({
      data: { userId, token },
    });
  }
}
