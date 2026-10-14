import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true, unique: true })
  mobile!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({
    enum: ['CUSTOMER', 'RESTAURANT', 'DELIVERY', 'ADMIN'],
    default: 'CUSTOMER',
  })
  role!: string;

  @Prop({ default: true })
  status!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);