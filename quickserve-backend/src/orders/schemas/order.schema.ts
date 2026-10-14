import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  // =====================================================
  // CUSTOMER / USER
  // =====================================================

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
  })
  userId!: Types.ObjectId;

  // =====================================================
  // RESTAURANT
  // =====================================================

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Restaurant',
  })
  restaurantId!: Types.ObjectId;

  // =====================================================
  // ORDER ITEMS
  // =====================================================

  @Prop({
    type: [
      {
        menuId: {
          type: String,
        },

        foodName: {
          type: String,
        },

        price: {
          type: Number,
        },

        quantity: {
          type: Number,
        },
      },
    ],

    default: [],
  })
  items!: {
    menuId: string;
    foodName: string;
    price: number;
    quantity: number;
  }[];

  // =====================================================
  // TOTAL AMOUNT
  // =====================================================

  @Prop({
    required: true,
  })
  totalAmount!: number;

  // =====================================================
  // ORDER STATUS
  // =====================================================

  @Prop({
    default: 'Pending',

    enum: [
      'Pending',
      'Accepted',
      'Preparing',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ],
  })
  status!: string;

  // =====================================================
  // PAYMENT STATUS
  // =====================================================

  @Prop({
    default: 'Pending',

    enum: [
      'Pending',
      'Paid',
      'Failed',
    ],
  })
  paymentStatus!: string;

  // =====================================================
  // DELIVERY BOY
  // =====================================================

  @Prop({
    type: String,
  })
  deliveryBoyId?: string;
}

export const OrderSchema =
  SchemaFactory.createForClass(Order);