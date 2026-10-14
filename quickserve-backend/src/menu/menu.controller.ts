import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';

import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Create menu item
  @Post()
create(@Body() createMenuDto: CreateMenuDto) {
  console.log('Received menu data:', createMenuDto);
  return this.menuService.create(createMenuDto);
}

  // Get all menu items or filter by restaurant
  @Get()
  findAll(@Query('restaurantId') restaurantId?: string) {
    return this.menuService.findAll(restaurantId);
  }

  // Get single menu item
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  // Update menu item
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    return this.menuService.update(id, createMenuDto);
  }

  // Delete menu item
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}