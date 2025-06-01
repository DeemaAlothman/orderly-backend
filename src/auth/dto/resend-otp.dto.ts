// src/auth/dto/resend-otp.dto.ts
import { IsString } from 'class-validator';

export class ResendOtpDto {
  @IsString()
  phone: string;
}
