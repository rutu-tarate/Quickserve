import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MenuDocument = HydratedDocument<Menu>;

@Schema({ timestamps: true })
export class Menu {
  @Prop({ required: true, trim: true })
  foodName!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ default: '' })
  description!: string;

  @Prop({ default: '' })
  image!: string;

  @Prop({ required: true, index: true })
  restaurantId!: string;

  @Prop({ required: true, trim: true })
  category!: string;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);