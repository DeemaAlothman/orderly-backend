// src/user/dto/update-profile.dto.ts
import {
  IsOptional,
  IsString,
  MinLength,
  IsNotEmpty,
  IsDate,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;

  @IsOptional()
  @IsString()
  confirmNewPassword?: string;

  @IsOptional()
  @IsDate()
  lastLogin?: Date;
}
