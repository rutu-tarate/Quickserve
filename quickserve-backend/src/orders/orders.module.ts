import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

import { Order, OrderSchema } from './schemas/order.schema';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import { Menu, MenuSchema } from '../menu/schemas/menu.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: Cart.name,
        schema: CartSchema,
      },
      {
        name: Menu.name,
        schema: MenuSchema,
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}