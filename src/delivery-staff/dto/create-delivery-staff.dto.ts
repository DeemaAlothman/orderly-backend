// src/delivery-staff/dto/create-delivery-staff.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { UserType } from '@prisma/client';

export class CreateDeliveryStaffDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  @IsNotEmpty()
  vehicle_type: string;

  @IsString()
  @IsNotEmpty()
  availability_status: string;

  // Optional: Include type if needed for validation, but it will be set to DELIVERY_STAFF
  @IsOptional()
  type?: UserType;
}
