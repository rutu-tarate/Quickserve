import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  User,
  UserDocument,
} from '../users/schemas/user.schema';

import {
  Restaurant,
  RestaurantDocument,
} from '../restaurants/schemas/restaurant.schema';

import {
  Order,
  OrderDocument,
} from '../orders/schemas/order.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  // =====================================================
  // DASHBOARD
  // =====================================================

  async getDashboard() {
    const totalUsers =
      await this.userModel.countDocuments();

    const totalRestaurants =
      await this.restaurantModel.countDocuments();

    const totalOrders =
      await this.orderModel.countDocuments();

    const completedOrders =
      await this.orderModel.countDocuments({
        status: 'Delivered',
      });

    const pendingOrders =
      await this.orderModel.countDocuments({
        status: {
          $in: [
            'Pending',
            'Accepted',
            'Preparing',
            'Out for Delivery',
          ],
        },
      });

    const cancelledOrders =
      await this.orderModel.countDocuments({
        status: 'Cancelled',
      });

    const revenueResult =
      await this.orderModel.aggregate([
        {
          $match: {
            status: 'Delivered',
          },
        },

        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum: '$totalAmount',
            },
          },
        },
      ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    return {
      success: true,

      data: {
        totalUsers,
        totalRestaurants,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue,
      },
    };
  }

  // =====================================================
  // USERS
  // =====================================================

  // Get All Users

  async getAllUsers() {
    const users =
      await this.userModel
        .find()
        .select('-password')
        .sort({ createdAt: -1 });

    return {
      success: true,
      data: users,
    };
  }

  // Get User By ID

  async getUserById(id: string) {
    const user =
      await this.userModel
        .findById(id)
        .select('-password');

    return {
      success: true,
      data: user,
    };
  }

  // Block / Unblock User

  async updateUserStatus(
    id: string,
    status: boolean,
  ) {
    const user =
      await this.userModel
        .findByIdAndUpdate(
          id,
          { status },
          { new: true },
        )
        .select('-password');

    return {
      success: true,

      message: status
        ? 'User unblocked successfully'
        : 'User blocked successfully',

      data: user,
    };
  }

  // =====================================================
  // RESTAURANTS
  // =====================================================

  // Get All Restaurants

  async getAllRestaurants() {
    const restaurants =
      await this.restaurantModel
        .find()
        .sort({ createdAt: -1 });

    return {
      success: true,
      data: restaurants,
    };
  }

  // Get Restaurant By ID

  async getRestaurantById(id: string) {
    const restaurant =
      await this.restaurantModel.findById(id);

    return {
      success: true,
      data: restaurant,
    };
  }

  // Block / Unblock Restaurant

  async updateRestaurantStatus(
    id: string,
    status: boolean,
  ) {
    const restaurant =
      await this.restaurantModel.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      );

    return {
      success: true,

      message: status
        ? 'Restaurant unblocked successfully'
        : 'Restaurant blocked successfully',

      data: restaurant,
    };
  }

  // =====================================================
  // ORDERS
  // =====================================================

  // Get All Orders
  // Customer Name + Restaurant Name

  async getAllOrders() {
    const orders =
      await this.orderModel
        .find()

        // Customer details
        .populate(
          'userId',
          'name email mobile',
        )

        // Restaurant details
        .populate(
          'restaurantId',
          'name',
        )

        .sort({
          createdAt: -1,
        });

    return {
      success: true,
      data: orders,
    };
  }

  // =====================================================
  // GET ORDER BY ID
  // =====================================================

  async getOrderById(id: string) {
    const order =
      await this.orderModel
        .findById(id)

        // Customer details
        .populate(
          'userId',
          'name email mobile',
        )

        // Restaurant details
        .populate(
          'restaurantId',
          'name',
        );

    return {
      success: true,
      data: order,
    };
  }

  // =====================================================
  // GET ORDERS BY STATUS
  // =====================================================

  async getOrdersByStatus(
    status: string,
  ) {
    const orders =
      await this.orderModel
        .find({
          status,
        })

        // Customer details
        .populate(
          'userId',
          'name email mobile',
        )

        // Restaurant details
        .populate(
          'restaurantId',
          'name',
        )

        .sort({
          createdAt: -1,
        });

    return {
      success: true,
      data: orders,
    };
  }

  // =====================================================
  // REVENUE
  // =====================================================

  // Total Revenue

  async getTotalRevenue() {
    const result =
      await this.orderModel.aggregate([
        {
          $match: {
            status: 'Delivered',
          },
        },

        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum: '$totalAmount',
            },
          },
        },
      ]);

    const totalRevenue =
      result.length > 0
        ? result[0].totalRevenue
        : 0;

    return {
      success: true,

      data: {
        totalRevenue,
      },
    };
  }

  // =====================================================
  // DAILY REVENUE
  // =====================================================

  async getDailyRevenue() {
    const result =
      await this.orderModel.aggregate([
        {
          $match: {
            status: 'Delivered',
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',

                date: '$createdAt',
              },
            },

            revenue: {
              $sum: '$totalAmount',
            },

            orders: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: -1,
          },
        },
      ]);

    return {
      success: true,
      data: result,
    };
  }

  // =====================================================
  // MONTHLY REVENUE
  // =====================================================

  async getMonthlyRevenue() {
    const result =
      await this.orderModel.aggregate([
        {
          $match: {
            status: 'Delivered',
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m',

                date: '$createdAt',
              },
            },

            revenue: {
              $sum: '$totalAmount',
            },

            orders: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: -1,
          },
        },
      ]);

    return {
      success: true,
      data: result,
    };
  }
}