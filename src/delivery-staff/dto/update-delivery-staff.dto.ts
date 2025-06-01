
import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryStaffDto } from './create-delivery-staff.dto';

export class UpdateDeliveryStaffDto extends PartialType(
  CreateDeliveryStaffDto,
) {}
