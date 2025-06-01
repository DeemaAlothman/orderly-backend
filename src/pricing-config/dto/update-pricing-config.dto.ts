import { IsDecimal, IsOptional, IsString } from 'class-validator';

export class UpdatePricingConfigDto {
  @IsDecimal()
  config_value: number;

  @IsOptional()
  @IsString()
  description?: string;
}
