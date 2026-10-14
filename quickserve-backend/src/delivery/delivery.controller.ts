import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
  ) {}

  // Assign Delivery Boy
  @Post('assign/:orderId')
  assignDeliveryBoy(
    @Param('orderId') orderId: string,
    @Body('deliveryBoyId') deliveryBoyId: string,
  ) {
    return this.deliveryService.assignDeliveryBoy(
      orderId,
      deliveryBoyId,
    );
  }

  // Delivery Boy Accept Order
  @Patch('accept/:orderId')
  acceptOrder(
    @Param('orderId') orderId: string,
  ) {
    return this.deliveryService.acceptOrder(orderId);
  }

  // Out For Delivery
  @Patch('out-for-delivery/:orderId')
  outForDelivery(
    @Param('orderId') orderId: string,
  ) {
    return this.deliveryService.outForDelivery(orderId);
  }

  // Delivered
  @Patch('delivered/:orderId')
  delivered(
    @Param('orderId') orderId: string,
  ) {
    return this.deliveryService.delivered(orderId);
  }

  // Get Delivery Boy Orders
  @Get('my-orders/:deliveryBoyId')
  myDeliveries(
    @Param('deliveryBoyId') deliveryBoyId: string,
  ) {
    return this.deliveryService.myDeliveries(
      deliveryBoyId,
    );
  }
}