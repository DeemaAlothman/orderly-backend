import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateUserAddressDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  long: number;

  @IsString()
  @IsNotEmpty()
  location_name: string;

  @IsBoolean()
  is_active: boolean;
}
