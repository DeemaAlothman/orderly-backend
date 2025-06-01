// src/user/dto/update-user.dto.ts
import { IsOptional, IsString, MinLength, IsDate } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDate()
  lastLogin?: Date; // أضف هذا الحقل

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string; // أضف هذا الحقل
}
