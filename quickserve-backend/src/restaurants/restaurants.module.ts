import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Restaurant,
  RestaurantSchema,
} from './schemas/restaurant.schema';

import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Restaurant.name,
        schema: RestaurantSchema,
      },
    ]),
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}