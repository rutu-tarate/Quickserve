import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  // =====================================================
  // PLACE ORDER
  // =====================================================

  @Post()
  @UseGuards(JwtAuthGuard)
  placeOrder(
    @Req() req: any,
    @Body() dto: CreateOrderDto,
  ) {
    const userId = req.user.id;

    return this.ordersService.placeOrder(
      userId,
      dto,
    );
  }

  // =====================================================
  // MY ORDERS
  // =====================================================

  @Get('my')
  @UseGuards(JwtAuthGuard)
  myOrders(@Req() req: any) {
    const userId = req.user.id;

    return this.ordersService.myOrders(
      userId,
    );
  }

  // =====================================================
  // RESTAURANT ORDERS
  // =====================================================

  @Get('restaurant/:restaurantId')
  @UseGuards(JwtAuthGuard)
  restaurantOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersService.restaurantOrders(
      restaurantId,
    );
  }

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      dto,
    );
  }

  // =====================================================
  // CANCEL ORDER
  // =====================================================

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelOrder(
    @Param('id') id: string,
  ) {
    return this.ordersService.cancelOrder(id);
  }
}