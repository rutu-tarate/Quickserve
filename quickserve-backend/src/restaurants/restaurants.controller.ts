import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { RestaurantsService } from './restaurants.service';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
  ) {}

  // =========================================
  // CREATE RESTAURANT
  // =========================================

  @Post()
  create(
    @Body() createRestaurantDto: CreateRestaurantDto,
  ) {
    return this.restaurantsService.create(
      createRestaurantDto,
    );
  }

  // =========================================
  // GET ALL RESTAURANTS
  // =========================================

  @Get()
  findAll() {
    return this.restaurantsService.findAll();
  }

  // =========================================
  // GET RESTAURANT BY ID
  // =========================================

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  // =========================================
  // UPDATE RESTAURANT
  // =========================================

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(
      id,
      updateRestaurantDto,
    );
  }

  // =========================================
  // UPDATE RESTAURANT STATUS
  // =========================================

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: boolean,
  ) {
    return this.restaurantsService.updateStatus(
      id,
      status,
    );
  }

  // =========================================
  // DELETE RESTAURANT
  // =========================================

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantsService.remove(id);
  }
}