import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePricingConfigDto } from './dto/update-pricing-config.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PricingConfigService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pricingConfig.findMany();
  }

  async findOne(config_key: string) {
    const config = await this.prisma.pricingConfig.findUnique({
      where: { config_key },
    });
    if (!config) throw new NotFoundException('الإعداد غير موجود');
    return config;
  }

  async update(
    config_key: string,
    dto: UpdatePricingConfigDto,
    adminId: string,
  ) {
    const config = await this.prisma.pricingConfig.findUnique({
      where: { config_key },
    });
    if (!config) throw new NotFoundException('الإعداد غير موجود');

    return this.prisma.pricingConfig.update({
      where: { config_key },
      data: {
        config_value: new Decimal(dto.config_value),
        description: dto.description,
        updated_by: adminId,
      },
    });
  }
}
