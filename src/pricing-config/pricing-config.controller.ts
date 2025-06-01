import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserType } from '../common/enums/user-type.enum';
import { UpdatePricingConfigDto } from './dto/update-pricing-config.dto';
import { PricingConfigService } from './pricing-config.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pricing-config')
export class PricingConfigController {
  constructor(private readonly service: PricingConfigService) {}

  @Patch(':key')
  @Roles(UserType.ADMIN)
  update(
    @Param('key') key: string,
    @Body() dto: UpdatePricingConfigDto,
    @Request() req: any,
  ) {
    return this.service.update(key, dto, req.user.id);
  }
}

