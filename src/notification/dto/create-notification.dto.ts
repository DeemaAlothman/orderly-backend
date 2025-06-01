import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  notification_type: string;

  @IsOptional()
  is_read?: boolean;
}
