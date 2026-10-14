import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';

import {
  User,
  UserDocument,
} from './schemas/user.schema';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // =====================================================
  // CREATE USER
  // =====================================================

  async create(
    createUserDto: CreateUserDto,
  ): Promise<UserDocument> {

    const existingUser =
      await this.findByEmail(
        createUserDto.email,
      );

    if (existingUser) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    const user =
      new this.userModel(createUserDto);

    return await user.save();
  }

  // =====================================================
  // GET ALL USERS
  // =====================================================

  async findAll(): Promise<UserDocument[]> {

    return await this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  // =====================================================
  // FIND USER BY EMAIL
  // =====================================================

  async findByEmail(
    email: string,
  ): Promise<UserDocument | null> {

    return await this.userModel
      .findOne({ email })
      .exec();
  }

  // =====================================================
  // FIND USER BY MOBILE
  // =====================================================

  async findByMobile(
    mobile: string,
  ): Promise<UserDocument | null> {

    return await this.userModel
      .findOne({ mobile })
      .exec();
  }

  // =====================================================
  // CREATE USER - AUTH
  // =====================================================

  async createUser(
    user: Partial<User>,
  ): Promise<UserDocument> {

    const newUser =
      new this.userModel(user);

    return await newUser.save();
  }

  // =====================================================
  // CREATE DELIVERY PARTNER
  // =====================================================

  async createDeliveryPartner(
    name: string,
    email: string,
    mobile: string,
    password: string,
  ): Promise<UserDocument> {

    const existingEmail =
      await this.findByEmail(email);

    if (existingEmail) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    const existingMobile =
      await this.findByMobile(mobile);

    if (existingMobile) {
      throw new ConflictException(
        'Mobile already exists',
      );
    }

    // Password Hash
    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      new this.userModel({
        name,
        email,
        mobile,
        password: hashedPassword,
        role: 'DELIVERY',
        status: true,
      });

    return await user.save();
  }

  // =====================================================
  // GET ALL DELIVERY PARTNERS
  // =====================================================

  async getDeliveryPartners() {

    const deliveryPartners =
      await this.userModel
        .find({
          role: 'DELIVERY',
        })
        .select('-password')
        .sort({ createdAt: -1 })
        .exec();

    return {
      success: true,
      data: deliveryPartners,
    };
  }

  // =====================================================
  // GET DELIVERY PARTNER BY ID
  // =====================================================

  async getDeliveryPartnerById(
    id: string,
  ) {

    const deliveryPartner =
      await this.userModel
        .findOne({
          _id: id,
          role: 'DELIVERY',
        })
        .select('-password')
        .exec();

    if (!deliveryPartner) {
      throw new NotFoundException(
        'Delivery partner not found',
      );
    }

    return {
      success: true,
      data: deliveryPartner,
    };
  }

  // =====================================================
  // BLOCK / UNBLOCK DELIVERY PARTNER
  // =====================================================

  async updateDeliveryPartnerStatus(
    id: string,
    status: boolean,
  ) {

    const deliveryPartner =
      await this.userModel.findOne({
        _id: id,
        role: 'DELIVERY',
      });

    if (!deliveryPartner) {
      throw new NotFoundException(
        'Delivery partner not found',
      );
    }

    deliveryPartner.status = status;

    await deliveryPartner.save();

    const updatedPartner =
      await this.userModel
        .findById(id)
        .select('-password')
        .exec();

    return {
      success: true,

      message: status
        ? 'Delivery partner unblocked successfully'
        : 'Delivery partner blocked successfully',

      data: updatedPartner,
    };
  }

  // =====================================================
  // DELIVERY PARTNER STATS
  // =====================================================

  async getDeliveryPartnerStats() {

    const total =
      await this.userModel.countDocuments({
        role: 'DELIVERY',
      });

    const active =
      await this.userModel.countDocuments({
        role: 'DELIVERY',
        status: true,
      });

    const blocked =
      await this.userModel.countDocuments({
        role: 'DELIVERY',
        status: false,
      });

    return {
      success: true,

      data: {
        total,
        active,
        blocked,
      },
    };
  }
}