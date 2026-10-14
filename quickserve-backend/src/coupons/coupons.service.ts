import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import {
  Coupon,
  CouponDocument,
  DiscountType,
} from './schemas/coupon.schema';

import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
  ) {}

  // =====================================================
  // CREATE COUPON
  // =====================================================

  async create(createCouponDto: CreateCouponDto) {
    const code = createCouponDto.code.trim().toUpperCase();

    const existingCoupon = await this.couponModel.findOne({
      code,
    });

    if (existingCoupon) {
      throw new BadRequestException(
        'Coupon code already exists',
      );
    }

    const validFrom = new Date(createCouponDto.validFrom);
    const validUntil = new Date(createCouponDto.validUntil);

    if (validUntil <= validFrom) {
      throw new BadRequestException(
        'Valid until date must be after valid from date',
      );
    }

    // Percentage discount validation
    if (
      createCouponDto.discountType ===
        DiscountType.PERCENTAGE &&
      createCouponDto.discountValue > 100
    ) {
      throw new BadRequestException(
        'Percentage discount cannot be more than 100%',
      );
    }

    const coupon = await this.couponModel.create({
      ...createCouponDto,
      code,
      validFrom,
      validUntil,
    });

    return {
      message: 'Coupon created successfully',
      coupon,
    };
  }

  // =====================================================
  // GET ALL COUPONS
  // =====================================================

  async findAll() {
    const coupons = await this.couponModel
      .find()
      .sort({ createdAt: -1 })
      .lean();

    return {
      total: coupons.length,
      coupons,
    };
  }

  // =====================================================
  // GET COUPON BY ID
  // =====================================================

  async findOne(id: string) {
    const coupon = await this.couponModel.findById(id);

    if (!coupon) {
      throw new NotFoundException(
        'Coupon not found',
      );
    }

    return coupon;
  }

  // =====================================================
  // GET COUPON BY CODE
  // =====================================================

  async findByCode(code: string) {
    const coupon = await this.couponModel.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!coupon) {
      throw new NotFoundException(
        'Coupon not found',
      );
    }

    return coupon;
  }

  // =====================================================
  // UPDATE COUPON
  // =====================================================

  async update(
    id: string,
    updateCouponDto: UpdateCouponDto,
  ) {
    const existingCoupon =
      await this.couponModel.findById(id);

    if (!existingCoupon) {
      throw new NotFoundException(
        'Coupon not found',
      );
    }

    if (updateCouponDto.code) {
      const newCode =
        updateCouponDto.code.trim().toUpperCase();

      const duplicate =
        await this.couponModel.findOne({
          code: newCode,
          _id: { $ne: id },
        });

      if (duplicate) {
        throw new BadRequestException(
          'Coupon code already exists',
        );
      }

      updateCouponDto.code = newCode;
    }

    const validFrom = updateCouponDto.validFrom
      ? new Date(updateCouponDto.validFrom)
      : existingCoupon.validFrom;

    const validUntil = updateCouponDto.validUntil
      ? new Date(updateCouponDto.validUntil)
      : existingCoupon.validUntil;

    if (validUntil <= validFrom) {
      throw new BadRequestException(
        'Valid until date must be after valid from date',
      );
    }

    const discountType =
      updateCouponDto.discountType ||
      existingCoupon.discountType;

    const discountValue =
      updateCouponDto.discountValue ??
      existingCoupon.discountValue;

    if (
      discountType === DiscountType.PERCENTAGE &&
      discountValue > 100
    ) {
      throw new BadRequestException(
        'Percentage discount cannot be more than 100%',
      );
    }

    const updatedCoupon =
      await this.couponModel.findByIdAndUpdate(
        id,
        {
          ...updateCouponDto,
          validFrom,
          validUntil,
        },
        {
          new: true,
          runValidators: true,
        },
      );

    return {
      message: 'Coupon updated successfully',
      coupon: updatedCoupon,
    };
  }

  // =====================================================
  // DELETE COUPON
  // =====================================================

  async remove(id: string) {
    const coupon =
      await this.couponModel.findByIdAndDelete(id);

    if (!coupon) {
      throw new NotFoundException(
        'Coupon not found',
      );
    }

    return {
      message: 'Coupon deleted successfully',
    };
  }

  // =====================================================
  // ACTIVATE / DEACTIVATE
  // =====================================================

  async toggleStatus(id: string) {
    const coupon =
      await this.couponModel.findById(id);

    if (!coupon) {
      throw new NotFoundException(
        'Coupon not found',
      );
    }

    coupon.isActive = !coupon.isActive;

    await coupon.save();

    return {
      message: coupon.isActive
        ? 'Coupon activated successfully'
        : 'Coupon deactivated successfully',

      coupon,
    };
  }

  // =====================================================
  // COUPON STATS
  // =====================================================

  async getStats() {
    const coupons =
      await this.couponModel.find();

    const now = new Date();

    const total = coupons.length;

    const active = coupons.filter(
      (coupon) =>
        coupon.isActive &&
        coupon.validFrom <= now &&
        coupon.validUntil >= now,
    ).length;

    const expired = coupons.filter(
      (coupon) =>
        coupon.validUntil < now,
    ).length;

    const inactive = coupons.filter(
      (coupon) => !coupon.isActive,
    ).length;

    return {
      total,
      active,
      expired,
      inactive,
    };
  }

  // =====================================================
  // APPLY / VALIDATE COUPON
  // =====================================================

  async validateCoupon(
    code: string,
    orderAmount: number,
    restaurantId?: string,
  ) {
    const coupon =
      await this.couponModel.findOne({
        code: code.trim().toUpperCase(),
      });

    if (!coupon) {
      throw new NotFoundException(
        'Invalid coupon code',
      );
    }

    const now = new Date();

    if (!coupon.isActive) {
      throw new BadRequestException(
        'Coupon is inactive',
      );
    }

    if (now < coupon.validFrom) {
      throw new BadRequestException(
        'Coupon is not active yet',
      );
    }

    if (now > coupon.validUntil) {
      throw new BadRequestException(
        'Coupon has expired',
      );
    }

    if (
      coupon.usageLimit > 0 &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      throw new BadRequestException(
        'Coupon usage limit reached',
      );
    }

    if (
      orderAmount < coupon.minOrderAmount
    ) {
      throw new BadRequestException(
        `Minimum order amount is ₹${coupon.minOrderAmount}`,
      );
    }

    if (
      coupon.restaurantId &&
      restaurantId &&
      coupon.restaurantId !== restaurantId
    ) {
      throw new BadRequestException(
        'Coupon is not valid for this restaurant',
      );
    }

    let discount = 0;

    if (
      coupon.discountType ===
      DiscountType.PERCENTAGE
    ) {
      discount =
        (orderAmount *
          coupon.discountValue) /
        100;

      if (
        coupon.maxDiscountAmount > 0 &&
        discount >
          coupon.maxDiscountAmount
      ) {
        discount =
          coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;

      if (discount > orderAmount) {
        discount = orderAmount;
      }
    }

    const finalAmount =
      orderAmount - discount;

    return {
      valid: true,

      message:
        'Coupon applied successfully',

      coupon: {
        id: coupon._id,
        code: coupon.code,
        title: coupon.title,
      },

      orderAmount,

      discount,

      finalAmount,
    };
  }
}