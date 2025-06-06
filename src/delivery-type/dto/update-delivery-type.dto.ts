// src/delivery-type/dto/update-delivery-type.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryTypeDto } from './create-delivery-type.dto';

export class UpdateDeliveryTypeDto extends PartialType(CreateDeliveryTypeDto) {}
