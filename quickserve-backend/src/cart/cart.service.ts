
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Cart, CartDocument } from './schemas/cart.schema';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  // Add a new item or increase its existing quantity
  async addToCart(userId: string, dto: CreateCartDto) {
    if (!dto.menuId || !Number.isInteger(dto.quantity) || dto.quantity < 1) {
      throw new BadRequestException(
        'Valid menuId and quantity are required',
      );
    }

    const cart = await this.cartModel.findOneAndUpdate(
      { userId, menuId: dto.menuId },
      { $inc: { quantity: dto.quantity } },
      { new: true },
    );

    if (cart) {
      return {
        success: true,
        message: 'Cart quantity updated',
        data: cart,
      };
    }

    const newCart = await this.cartModel.create({
      userId,
      menuId: dto.menuId,
      quantity: dto.quantity,
    });

    return {
      success: true,
      message: 'Item added to cart successfully',
      data: newCart,
    };
  }

  // Fetch the logged-in user's cart
  async getCart(userId: string) {
    const cart = await this.cartModel.find({ userId });

    return {
      success: true,
      message: 'Cart fetched successfully',
      data: cart,
    };
  }

  // Update quantity
  async updateQuantity(
    id: string,
    userId: string,
    dto: UpdateCartDto,
  ) {
    if (!Number.isInteger(dto.quantity) || dto.quantity < 1) {
      throw new BadRequestException(
        'Quantity must be at least 1',
      );
    }

    const cart = await this.cartModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { quantity: dto.quantity } },
      { new: true },
    );

    if (!cart) {
      throw new NotFoundException('Cart item not found');
    }

    return {
      success: true,
      message: 'Cart updated successfully',
      data: cart,
    };
  }

  // Remove item
  async removeItem(id: string, userId: string) {
    const cart = await this.cartModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!cart) {
      throw new NotFoundException('Cart item not found');
    }

    return {
      success: true,
      message: 'Item removed successfully',
      data: cart,
    };
  }
}
