import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Delivery } from './schemas/delivery.schema';
import { Order } from '../orders/schemas/order.schema';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectModel(Delivery.name)
    private readonly deliveryModel: Model<Delivery>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}

  // Assign Delivery Boy
  async assignDeliveryBoy(
    orderId: string,
    deliveryBoyId: string,
  ) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'Cancelled') {
      throw new BadRequestException(
        'Cannot assign delivery boy to cancelled order',
      );
    }

    const existingDelivery =
      await this.deliveryModel.findOne({ orderId });

    if (existingDelivery) {
      throw new BadRequestException(
        'Delivery boy already assigned to this order',
      );
    }

    const delivery = await this.deliveryModel.create({
      orderId,
      deliveryBoyId,
      status: 'ASSIGNED',
    });

    // Save delivery boy in Order
    order.deliveryBoyId = deliveryBoyId;
    await order.save();

    return {
      success: true,
      message: 'Delivery boy assigned successfully',
      data: delivery,
    };
  }

  // Delivery Boy Accept Order
  async acceptOrder(orderId: string) {
    const delivery =
      await this.deliveryModel.findOne({ orderId });

    if (!delivery) {
      throw new NotFoundException(
        'Delivery record not found',
      );
    }

    if (delivery.status !== 'ASSIGNED') {
      throw new BadRequestException(
        'Order cannot be accepted at this stage',
      );
    }

    delivery.status = 'ACCEPTED';
    await delivery.save();

    return {
      success: true,
      message: 'Order accepted successfully',
      data: delivery,
    };
  }

  // Out For Delivery
  async outForDelivery(orderId: string) {
    const delivery =
      await this.deliveryModel.findOne({ orderId });

    if (!delivery) {
      throw new NotFoundException(
        'Delivery record not found',
      );
    }

    if (delivery.status !== 'ACCEPTED') {
      throw new BadRequestException(
        'Order must be accepted first',
      );
    }

    delivery.status = 'OUT_FOR_DELIVERY';
    await delivery.save();

    await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        status: 'Out for Delivery',
      },
      {
        new: true,
      },
    );

    return {
      success: true,
      message: 'Order is out for delivery',
      data: delivery,
    };
  }

  // Delivered
  async delivered(orderId: string) {
    const delivery =
      await this.deliveryModel.findOne({ orderId });

    if (!delivery) {
      throw new NotFoundException(
        'Delivery record not found',
      );
    }

    if (delivery.status !== 'OUT_FOR_DELIVERY') {
      throw new BadRequestException(
        'Order must be out for delivery first',
      );
    }

    delivery.status = 'DELIVERED';
    await delivery.save();

    await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        status: 'Delivered',
      },
      {
        new: true,
      },
    );

    return {
      success: true,
      message: 'Order delivered successfully',
      data: delivery,
    };
  }

  // Get Delivery Boy Orders
  async myDeliveries(deliveryBoyId: string) {
    const deliveries =
      await this.deliveryModel.find({
        deliveryBoyId,
      });

    return {
      success: true,
      message: 'Delivery orders fetched successfully',
      data: deliveries,
    };
  }
}