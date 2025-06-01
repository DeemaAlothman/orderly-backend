// src/delivery-staff/delivery-staff.controller.ts
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { DeliveryStaffService } from './delivery-staff.service';
import { CreateDeliveryStaffDto } from './dto/create-delivery-staff.dto';
import { UpdateDeliveryStaffDto } from './dto/update-delivery-staff.dto';

@Controller('delivery-staff')
export class DeliveryStaffController {
  constructor(private readonly deliveryStaffService: DeliveryStaffService) {}

  @Post('register')
  async register(@Body() dto: CreateDeliveryStaffDto) {
    return this.deliveryStaffService.create(dto);
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
}
