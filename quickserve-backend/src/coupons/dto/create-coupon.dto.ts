import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { DiscountType } from '../schemas/coupon.schema';

export class CreateCouponDto {
  @IsString()
  code!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @IsNumber()
  @Min(0)
  discountValue!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsString()
  restaurantId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @IsDateString()
  validFrom!: string;

  @IsDateString()
  validUntil!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}