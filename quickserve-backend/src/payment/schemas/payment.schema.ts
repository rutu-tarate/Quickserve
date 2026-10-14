import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true })
  orderId!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({
    default: 'PENDING',
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
  })
  status!: string;

  @Prop()
  razorpayOrderId!: string;

  // Razorpay transaction/payment ID
  @Prop()
  razorpayPaymentId?: string;

  // Razorpay verification signature
  @Prop()
  razorpaySignature?: string;

  // Actual successful payment date and time
  @Prop()
  paidAt?: Date;
}

export const PaymentSchema =
  SchemaFactory.createForClass(Payment);