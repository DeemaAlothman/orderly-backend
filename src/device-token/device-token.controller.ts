import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { DeviceTokenService } from './device-token.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString } from 'class-validator';

class SaveDeviceTokenDto {
  @IsString()
  token: string;
}

@UseGuards(JwtAuthGuard)
@Controller('device-token')
export class DeviceTokenController {
  constructor(private readonly deviceTokenService: DeviceTokenService) {}

  @Post()
  async saveToken(@Body() dto: SaveDeviceTokenDto, @Request() req: any) {
    const userId = req.user.id;
    return this.deviceTokenService.saveOrUpdate(userId, dto.token);
  }
}
