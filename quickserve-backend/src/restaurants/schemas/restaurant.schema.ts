import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({
  timestamps: true,
})
export class Restaurant {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  owner!: string;

  @Prop({ required: true })
  address!: string;

  @Prop({ required: true, unique: true })
  phone!: string;

  @Prop()
  image!: string;

  @Prop({ default: true })
  status!: boolean;
}

export const RestaurantSchema =
  SchemaFactory.createForClass(Restaurant);