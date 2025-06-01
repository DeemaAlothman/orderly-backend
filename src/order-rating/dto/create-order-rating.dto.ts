import { IsInt, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';

export class CreateOrderRatingDto {
  @IsUUID()
  orderId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating_score: number;

  @IsOptional()
  @IsString()
  review_text?: string;
}
