import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumberString,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsUUID()
  category_id: string;

  @IsNotEmpty()
  @IsString()
  name_ar: string;

  @IsNotEmpty()
  @IsString()
  name_en: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumberString()
  base_price: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
