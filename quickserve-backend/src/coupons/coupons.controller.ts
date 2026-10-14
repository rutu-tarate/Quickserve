import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CouponsService } from './coupons.service';

import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(
    private readonly couponsService: CouponsService,
  ) {}

  // =====================================================
  // CREATE
  // POST /coupons
  // =====================================================

  @Post()
  create(
    @Body() createCouponDto: CreateCouponDto,
  ) {
    return this.couponsService.create(
      createCouponDto,
    );
  }

  // =====================================================
  // GET ALL
  // GET /coupons
  // =====================================================

  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  // =====================================================
  // STATS
  // GET /coupons/stats
  // =====================================================

  @Get('stats')
  getStats() {
    return this.couponsService.getStats();
  }

  // =====================================================
  // VALIDATE COUPON
  // GET /coupons/validate?code=SAVE50&orderAmount=500
  // =====================================================

  @Get('validate')
  validateCoupon(
    @Query('code') code: string,
    @Query('orderAmount') orderAmount: string,
    @Query('restaurantId') restaurantId?: string,
  ) {
    return this.couponsService.validateCoupon(
      code,
      Number(orderAmount),
      restaurantId,
    );
  }

  // =====================================================
  // GET BY CODE
  // GET /coupons/code/SAVE50
  // =====================================================

  @Get('code/:code')
  findByCode(
    @Param('code') code: string,
  ) {
    return this.couponsService.findByCode(
      code,
    );
  }

  // =====================================================
  // GET BY ID
  // GET /coupons/:id
  // =====================================================

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.couponsService.findOne(id);
  }

  // =====================================================
  // UPDATE
  // PATCH /coupons/:id
  // =====================================================

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponsService.update(
      id,
      updateCouponDto,
    );
  }

  // =====================================================
  // TOGGLE STATUS
  // PATCH /coupons/:id/toggle-status
  // =====================================================

  @Patch(':id/toggle-status')
  toggleStatus(
    @Param('id') id: string,
  ) {
    return this.couponsService.toggleStatus(
      id,
    );
  }

  // =====================================================
  // DELETE
  // DELETE /coupons/:id
  // =====================================================

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.couponsService.remove(id);
  }
}