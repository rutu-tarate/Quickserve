import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { User, UserSchema } from '../users/schemas/user.schema';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurants/schemas/restaurant.schema';

import { Order, OrderSchema } from '../orders/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}