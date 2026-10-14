import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ComplaintDocument = HydratedDocument<Complaint>;

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

@Schema({
  timestamps: true,
})
export class Complaint {
  // =====================================================
  // CUSTOMER
  // =====================================================

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  customerId!: Types.ObjectId;

  // =====================================================
  // RESTAURANT
  // =====================================================

  @Prop({
    type: Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  })
  restaurantId!: Types.ObjectId;

  // =====================================================
  // ORDER
  // =====================================================

  @Prop({
    type: Types.ObjectId,
    ref: 'Order',
    required: true,
  })
  orderId!: Types.ObjectId;

  // =====================================================
  // COMPLAINT DETAILS
  // =====================================================

  @Prop({
    required: true,
    trim: true,
  })
  subject!: string;

  @Prop({
    required: true,
    trim: true,
  })
  description!: string;

  @Prop({
    required: true,
    trim: true,
  })
  category!: string;

  // =====================================================
  // STATUS
  // =====================================================

  @Prop({
    type: String,
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDING,
  })
  status!: ComplaintStatus;
}

export const ComplaintSchema =
  SchemaFactory.createForClass(Complaint);