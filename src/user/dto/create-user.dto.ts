// src/user/dto/create-user.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { UserType } from '../../common/enums/user-type.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber('SY') // يمكن تعديل الدولة حسب الحاجة
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsEnum(UserType)
  type: UserType;
}
