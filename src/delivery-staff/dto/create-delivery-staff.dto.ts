// src/delivery-staff/dto/create-delivery-staff.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { UserType } from '../../common/enums/user-type.enum';

export class CreateDeliveryStaffDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber('SY')
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty()
  @IsString()
  vehicle_type: string;

  @IsNotEmpty()
  @IsString()
  availability_status: string;
}
