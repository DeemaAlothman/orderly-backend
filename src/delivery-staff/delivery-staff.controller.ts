// src/delivery-staff/delivery-staff.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { DeliveryStaffService } from './delivery-staff.service';
import { CreateDeliveryStaffDto } from './dto/create-delivery-staff.dto';
import { UpdateDeliveryStaffDto } from './dto/update-delivery-staff.dto';
import { AuthService } from '../auth/auth.service';
import { UserType } from '@prisma/client';
import { UpdateLocationDto } from './dto/update-location.dto';
@Controller('delivery-staff')
export class DeliveryStaffController {
  constructor(
    private readonly deliveryStaffService: DeliveryStaffService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateDeliveryStaffDto) {
    return this.deliveryStaffService.create(dto);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body('phone') phone: string,
    @Body('otp') otp: string,
    @Body() dto: Partial<CreateDeliveryStaffDto>,
  ) {
    if (!phone || !otp) {
      throw new BadRequestException('رقم الهاتف ورمز OTP مطلوبان');
    }
    return this.authService.verifyOtpAndRegister(phone, otp, {
      name: dto.name,
      password: dto.password,
      address: dto.address,
      type: UserType.DELIVERY_STAFF,
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDeliveryStaffDto) {
    return this.deliveryStaffService.update(id, dto);
  }

  @Get()
  async findAll() {
    return this.deliveryStaffService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.deliveryStaffService.findOne(id);
  }
  @Post(':id/location')
  async updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.deliveryStaffService.updateLocation(id, dto.lat, dto.long);
  }
}
