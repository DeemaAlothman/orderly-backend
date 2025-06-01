// src/delivery-type/dto/create-delivery-type.dto.ts
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDeliveryTypeDto {
  @IsNotEmpty()
  @IsString()
  type_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  delivery_fee: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
