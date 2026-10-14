import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Order, OrderDocument } from './schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Menu, MenuDocument } from '../menu/schemas/menu.schema';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,

    @InjectModel(Menu.name)
    private readonly menuModel: Model<MenuDocument>,
  ) {}

  // Place Order
  async placeOrder(userId: string, dto: CreateOrderDto) {
    const cartItems = await this.cartModel.find({ userId });

    if (!cartItems.length) {
      throw new NotFoundException('Cart is empty');
    }

    let totalAmount = 0;

    const items: {
      menuId: string;
      foodName: string;
      price: number;
      quantity: number;
    }[] = [];
    

    for (const cart of cartItems) {
      const menu = await this.menuModel.findById(cart.menuId);

      if (!menu) continue;

      totalAmount += menu.price * cart.quantity;

      items.push({
        menuId: menu.id,
        foodName: menu.foodName,
        price: menu.price,
        quantity: cart.quantity,
      });
    }

    const order = await this.orderModel.create({
      userId,
      restaurantId: dto.restaurantId,
      items,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Pending',
    });

    await this.cartModel.deleteMany({ userId });

    return {
      success: true,
      message: 'Order placed successfully',
      data: order,
    };
  }

  // My Orders
  async myOrders(userId: string) {
    const orders = await this.orderModel.find({ userId });

    return {
      success: true,
      message: 'Orders fetched successfully',
      data: orders,
    };
  }

  // Restaurant Orders
  async restaurantOrders(restaurantId: string) {
    const orders = await this.orderModel.find({ restaurantId });

    return {
      success: true,
      message: 'Restaurant orders fetched successfully',
      data: orders,
    };
  }

  // Update Order Status
  async updateOrderStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      {
        status: dto.status,
      },
      {
        new: true,
      },
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      message: 'Order status updated successfully',
      data: order,
    };
  }

  // Cancel Order
  async cancelOrder(id: string) {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      {
        status: 'Cancelled',
      },
      {
        new: true,
      },
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    };
  }
}