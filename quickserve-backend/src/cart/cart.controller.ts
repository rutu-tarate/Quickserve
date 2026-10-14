
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Req() req: any, @Body() dto: CreateCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Patch(':id')
  updateQuantity(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateQuantity(id, req.user.id, dto);
  }

  @Delete(':id')
  removeItem(@Param('id') id: string, @Req() req: any) {
    return this.cartService.removeItem(id, req.user.id);
  }
}
