import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';

import { Menu, MenuDocument } from './schemas/menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu.name)
    private readonly menuModel: Model<MenuDocument>,
  ) {}

  // Create menu item
  async create(createMenuDto: CreateMenuDto) {
    return this.menuModel.create(createMenuDto);
  }

  // Get all menu items or restaurant-specific menu
  async findAll(restaurantId?: string) {
    if (restaurantId) {
      if (!isValidObjectId(restaurantId)) {
        throw new BadRequestException('Invalid restaurantId');
      }

      return this.menuModel
        .find({ restaurantId })
        .exec();
    }

    return this.menuModel.find().exec();
  }

  // Get menu item by ID
  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid menu item ID');
    }

    const menu = await this.menuModel.findById(id).exec();

    if (!menu) {
      throw new NotFoundException('Menu item not found');
    }

    return menu;
  }

  // Update menu item
  async update(id: string, createMenuDto: CreateMenuDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid menu item ID');
    }

    const menu = await this.menuModel
      .findByIdAndUpdate(id, createMenuDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!menu) {
      throw new NotFoundException('Menu item not found');
    }

    return menu;
  }

  // Delete menu item
  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid menu item ID');
    }

    const menu = await this.menuModel.findByIdAndDelete(id).exec();

    if (!menu) {
      throw new NotFoundException('Menu item not found');
    }

    return {
      message: 'Menu item deleted successfully',
    };
  }
}