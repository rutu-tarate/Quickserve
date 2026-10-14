import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

import {
  Delivery,
  DeliverySchema,
} from './schemas/delivery.schema';

import {
  Order,
  OrderSchema,
} from '../orders/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Delivery.name,
        schema: DeliverySchema,
      },
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
  ],

  controllers: [
    DeliveryController,
  ],

  providers: [
    DeliveryService,
  ],

  exports: [
    DeliveryService,
  ],
})
export class DeliveryModule {}