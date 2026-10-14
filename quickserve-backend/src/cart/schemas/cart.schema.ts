
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Menu',
  })
  menuId!: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    default: 1,
    min: 1,
  })
  quantity!: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
