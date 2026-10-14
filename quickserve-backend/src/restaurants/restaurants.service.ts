import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Restaurant,
  RestaurantDocument,
} from './schemas/restaurant.schema';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<RestaurantDocument>,
  ) {}

  // =========================================
  // CREATE RESTAURANT
  // =========================================

  async create(
    createRestaurantDto: CreateRestaurantDto,
  ) {
    const existingRestaurant =
      await this.restaurantModel.findOne({
        phone: createRestaurantDto.phone,
      });

    if (existingRestaurant) {
      throw new ConflictException(
        'Restaurant with this phone number already exists',
      );
    }

    try {
      const restaurant =
        await this.restaurantModel.create(
          createRestaurantDto,
        );

      return {
        success: true,
        message: 'Restaurant created successfully',
        data: restaurant,
      };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Restaurant with this phone number already exists',
        );
      }

      throw error;
    }
  }

  // =========================================
  // GET ALL RESTAURANTS
  // =========================================

  async findAll() {
    const restaurants =
      await this.restaurantModel
        .find()
        .sort({ createdAt: -1 });

    return {
      success: true,
      data: restaurants,
    };
  }

  // =========================================
  // GET RESTAURANT BY ID
  // =========================================

  async findOne(id: string) {
    const restaurant =
      await this.restaurantModel.findById(id);

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurant not found',
      );
    }

    return {
      success: true,
      data: restaurant,
    };
  }

  // =========================================
  // UPDATE RESTAURANT
  // =========================================

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
  ) {
    if (updateRestaurantDto.phone) {
      const existingRestaurant =
        await this.restaurantModel.findOne({
          phone: updateRestaurantDto.phone,
          _id: { $ne: id },
        });

      if (existingRestaurant) {
        throw new ConflictException(
          'Another restaurant already uses this phone number',
        );
      }
    }

    try {
      const restaurant =
        await this.restaurantModel.findByIdAndUpdate(
          id,
          updateRestaurantDto,
          {
            new: true,
            runValidators: true,
          },
        );

      if (!restaurant) {
        throw new NotFoundException(
          'Restaurant not found',
        );
      }

      return {
        success: true,
        message: 'Restaurant updated successfully',
        data: restaurant,
      };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Restaurant with this phone number already exists',
        );
      }

      throw error;
    }
  }

  // =========================================
  // UPDATE RESTAURANT STATUS
  // =========================================

  async updateStatus(
    id: string,
    status: boolean,
  ) {
    const restaurant =
      await this.restaurantModel.findByIdAndUpdate(
        id,
        { status },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurant not found',
      );
    }

    return {
      success: true,
      message: status
        ? 'Restaurant activated successfully'
        : 'Restaurant deactivated successfully',
      data: restaurant,
    };
  }

  // =========================================
  // DELETE RESTAURANT
  // =========================================

  async remove(id: string) {
    const restaurant =
      await this.restaurantModel.findByIdAndDelete(id);

    if (!restaurant) {
      throw new NotFoundException(
        'Restaurant not found',
      );
    }

    return {
      success: true,
      message: 'Restaurant deleted successfully',
    };
  }
}