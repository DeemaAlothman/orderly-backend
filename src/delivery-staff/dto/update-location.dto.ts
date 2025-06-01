// src/delivery-staff/dto/update-location.dto.ts
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  long: number;
}
