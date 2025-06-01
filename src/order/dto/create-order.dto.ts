// src/order/dto/create-order.dto.ts
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Prisma, OrderStatus } from '@prisma/client';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;

  @IsNotEmpty()
  @IsUUID()
  delivery_type_id: string;

 
  @IsNotEmpty()
  @IsString()
  base_amount: string;

  @IsNotEmpty()
  @IsString()
  delivery_fee: string;

  @IsOptional()
  @IsString()
  custom_items_amount?: string;

  @IsNotEmpty()
  @IsString()
  total_amount: string;

  @IsOptional()
  @IsString()
  customer_notes?: string;

  @IsOptional()
  @IsString()
  admin_notes?: string;

  @IsNotEmpty()
  order_date: Date;

  @IsNotEmpty()
  @IsUUID()
  addressId: string;

  @IsNotEmpty()
  @IsEnum(OrderStatus)
  order_status: OrderStatus;
}
