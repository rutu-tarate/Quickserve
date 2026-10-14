import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  })
  code!: string;

  @Prop({
    required: true,
    trim: true,
  })
  title!: string;

  @Prop({
    default: '',
    trim: true,
  })
  description!: string;

  @Prop({
    required: true,
    enum: DiscountType,
  })
  discountType!: DiscountType;

  @Prop({
    required: true,
    min: 0,
  })
  discountValue!: number;

  @Prop({
    default: 0,
    min: 0,
  })
  minOrderAmount!: number;

  @Prop({
    default: 0,
    min: 0,
  })
  maxDiscountAmount!: number;

  @Prop({
    required: false,
    default: null,
  })
  restaurantId!: string;

  @Prop({
    default: 0,
    min: 0,
  })
  usageLimit!: number;

  @Prop({
    default: 0,
    min: 0,
  })
  usedCount!: number;

  @Prop({
    required: true,
  })
  validFrom!: Date;

  @Prop({
    required: true,
  })
  validUntil!: Date;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);