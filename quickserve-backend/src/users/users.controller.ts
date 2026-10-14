import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService,
  ) {}

  // =====================================================
  // CREATE USER
  // =====================================================

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
  ) {

    return this.usersService.create(
      createUserDto,
    );
  }

  // =====================================================
  // GET ALL USERS
  // =====================================================

  @Get()
  findAll() {

    return this.usersService.findAll();
  }

  // =====================================================
  // GET PROFILE
  // =====================================================

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {

    return req.user;
  }

  // =====================================================
  // ADMIN TEST
  // =====================================================

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  @Get('admin')
  adminOnly() {

    return {
      message: 'Welcome Admin',
    };
  }

  // =====================================================
  // CREATE DELIVERY PARTNER
  // =====================================================

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  @Post('delivery-partner')
  createDeliveryPartner(
    @Body()
    body: {
      name: string;
      email: string;
      mobile: string;
      password: string;
    },
  ) {

    return this.usersService
      .createDeliveryPartner(
        body.name,
        body.email,
        body.mobile,
        body.password,
      );
  }

  // =====================================================
  // GET ALL DELIVERY PARTNERS
  // =====================================================

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  @Get('delivery-partners')
  getDeliveryPartners() {

    return this.usersService
      .getDeliveryPartners();
  }

  // =====================================================
  // GET DELIVERY PARTNER BY ID
  // =====================================================

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  @Get('delivery-partners/:id')
  getDeliveryPartnerById(
    @Param('id') id: string,
  ) {

    return this.usersService
      .getDeliveryPartnerById(id);
  }

  // =====================================================
  // BLOCK / UNBLOCK
  // =====================================================

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  @Patch(
    'delivery-partners/:id/status',
  )
  updateDeliveryPartnerStatus(
    @Param('id') id: string,

    @Body('status')
    status: boolean,
  ) {

    return this.usersService
      .updateDeliveryPartnerStatus(
        id,
        status,
      );
  }

  // =====================================================
  // DELIVERY PARTNER STATS
  // =====================================================

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  @Get('delivery-partners-stats')
  getDeliveryPartnerStats() {

    return this.usersService
      .getDeliveryPartnerStats();
  }
}