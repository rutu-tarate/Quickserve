import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeliveryDocument = Delivery & Document;

@Schema({ timestamps: true })
export class Delivery {
  @Prop({ required: true })
  orderId!: string;

  @Prop({ required: true })
  deliveryBoyId!: string;

  @Prop({
    default: 'ASSIGNED',
    enum: [
      'ASSIGNED',
      'ACCEPTED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ],
  })
  status!: string;
}

export const DeliverySchema =
  SchemaFactory.createForClass(Delivery);