import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Address,
  AddressDocument,
} from './schemas/address.schema';

import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
  ) {}

  // =========================================
  // ADD ADDRESS
  // =========================================

  async create(
    userId: string,
    dto: CreateAddressDto,
  ) {
    const userObjectId = new Types.ObjectId(userId);

    // If first address, automatically make it default
    const existingCount =
      await this.addressModel.countDocuments({
        userId: userObjectId,
      });

    let isDefault = dto.type === 'Home';

    if (existingCount === 0) {
      isDefault = true;
    }

    // If this address becomes default,
    // remove default from previous address
    if (isDefault) {
      await this.addressModel.updateMany(
        { userId: userObjectId },
        { $set: { isDefault: false } },
      );
    }

    const address =
      await this.addressModel.create({
        ...dto,
        userId: userObjectId,
        isDefault,
      });

    return {
      success: true,
      message: 'Address added successfully',
      data: address,
    };
  }

  // =========================================
  // GET MY ADDRESSES
  // =========================================

  async findMyAddresses(userId: string) {
    const addresses =
      await this.addressModel
        .find({
          userId: new Types.ObjectId(userId),
        })
        .sort({
          isDefault: -1,
          createdAt: -1,
        });

    return {
      success: true,
      data: addresses,
    };
  }

  // =========================================
  // GET SINGLE ADDRESS
  // =========================================

  async findOne(
    userId: string,
    id: string,
  ) {
    const address =
      await this.addressModel.findOne({
        _id: id,
        userId: new Types.ObjectId(userId),
      });

    if (!address) {
      throw new NotFoundException(
        'Address not found',
      );
    }

    return {
      success: true,
      data: address,
    };
  }

  // =========================================
  // SET DEFAULT ADDRESS
  // =========================================

  async setDefault(
    userId: string,
    id: string,
  ) {
    const userObjectId =
      new Types.ObjectId(userId);

    const address =
      await this.addressModel.findOne({
        _id: id,
        userId: userObjectId,
      });

    if (!address) {
      throw new NotFoundException(
        'Address not found',
      );
    }

    await this.addressModel.updateMany(
      { userId: userObjectId },
      { $set: { isDefault: false } },
    );

    address.isDefault = true;

    await address.save();

    return {
      success: true,
      message: 'Default address updated',
      data: address,
    };
  }

  // =========================================
  // DELETE ADDRESS
  // =========================================

  async remove(
    userId: string,
    id: string,
  ) {
    const address =
      await this.addressModel.findOneAndDelete({
        _id: id,
        userId: new Types.ObjectId(userId),
      });

    if (!address) {
      throw new NotFoundException(
        'Address not found',
      );
    }

    return {
      success: true,
      message: 'Address deleted successfully',
    };
  }
}