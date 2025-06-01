// src/auth/dto/login.dto.ts
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsPhoneNumber('SY') // يمكنك تغيير الدولة حسب الحاجة
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
