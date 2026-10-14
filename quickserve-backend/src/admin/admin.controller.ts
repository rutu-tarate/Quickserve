import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  // =====================================================
  // DASHBOARD
  // =====================================================

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // =====================================================
  // USERS
  // =====================================================

  // Get All Users
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  // Get User By ID
  @Get('users/:id')
  getUserById(
    @Param('id') id: string,
  ) {
    return this.adminService.getUserById(id);
  }

  // Block / Unblock User
  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: boolean,
  ) {
    return this.adminService.updateUserStatus(
      id,
      status,
    );
  }

  // =====================================================
  // RESTAURANTS
  // =====================================================

  // Get All Restaurants
  @Get('restaurants')
  getAllRestaurants() {
    return this.adminService.getAllRestaurants();
  }

  // Get Restaurant By ID
  @Get('restaurants/:id')
  getRestaurantById(
    @Param('id') id: string,
  ) {
    return this.adminService.getRestaurantById(id);
  }

  // Block / Unblock Restaurant
  @Patch('restaurants/:id/status')
  updateRestaurantStatus(
    @Param('id') id: string,
    @Body('status') status: boolean,
  ) {
    return this.adminService.updateRestaurantStatus(
      id,
      status,
    );
  }

  // =====================================================
  // ORDERS
  // =====================================================

  // Get All Orders
  @Get('orders')
  getAllOrders() {
    return this.adminService.getAllOrders();
  }

  // Get Orders By Status
  @Get('orders/status/:status')
  getOrdersByStatus(
    @Param('status') status: string,
  ) {
    return this.adminService.getOrdersByStatus(
      status,
    );
  }

  // Get Order By ID
  @Get('orders/:id')
  getOrderById(
    @Param('id') id: string,
  ) {
    return this.adminService.getOrderById(id);
  }

  // =====================================================
  // REVENUE
  // =====================================================

  // Total Revenue
  @Get('revenue')
  getTotalRevenue() {
    return this.adminService.getTotalRevenue();
  }

  // Daily Revenue
  @Get('revenue/daily')
  getDailyRevenue() {
    return this.adminService.getDailyRevenue();
  }

  // Monthly Revenue
  @Get('revenue/monthly')
  getMonthlyRevenue() {
    return this.adminService.getMonthlyRevenue();
  }
}