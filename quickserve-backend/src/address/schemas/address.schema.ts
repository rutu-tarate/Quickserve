import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ timestamps: true })
export class Address {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['Home', 'Work', 'Other'],
  })
  type!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  mobile!: string;

  @Prop({ required: true, trim: true })
  houseNo!: string;

  @Prop({ required: true, trim: true })
  area!: string;

  @Prop({ required: true, trim: true })
  city!: string;

  @Prop({ required: true, trim: true })
  state!: string;

  @Prop({ required: true, trim: true })
  pincode!: string;

  @Prop({ trim: true })
  landmark?: string;

  @Prop({ default: false })
  isDefault!: boolean;

  @Prop()
  latitude?: number;

  @Prop()
  longitude?: number;
}

export const AddressSchema =
  SchemaFactory.createForClass(Address);