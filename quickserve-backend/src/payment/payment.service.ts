import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import Razorpay from 'razorpay';
import * as crypto from 'crypto';

import { Payment } from './schemas/payment.schema';
import { Order } from '../orders/schemas/order.schema';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<Payment>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  // =====================================================
  // CREATE RAZORPAY ORDER
  // =====================================================

  async createPayment(orderId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if payment already exists
    const existingPayment =
      await this.paymentModel.findOne({
        orderId,
      });

    if (existingPayment?.status === 'SUCCESS') {
      throw new BadRequestException(
        'Payment already completed for this order',
      );
    }

    // Amount comes from backend Order
    const amount = order.totalAmount;

    // Create Razorpay Order
    const razorpayOrder =
      await this.razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: orderId,
      });

    // Save payment record
    const payment =
      await this.paymentModel.create({
        orderId,
        amount,
        status: 'PENDING',
        razorpayOrderId: razorpayOrder.id,
      });

    return {
      message: 'Payment order created successfully',
      payment,
      razorpayOrder,
    };
  }

  // =====================================================
  // VERIFY RAZORPAY PAYMENT
  // =====================================================

  async verifyPayment(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
  ) {
    // Generate Razorpay signature
    const generatedSignature =
      crypto
        .createHmac(
          'sha256',
          process.env.RAZORPAY_KEY_SECRET!,
        )
        .update(
          `${razorpayOrderId}|${razorpayPaymentId}`,
        )
        .digest('hex');

    // ===================================================
    // PAYMENT VERIFICATION FAILED
    // ===================================================

    if (
      generatedSignature !== razorpaySignature
    ) {
      await this.paymentModel.findOneAndUpdate(
        {
          razorpayOrderId,
        },
        {
          status: 'FAILED',
        },
      );

      return {
        message: 'Payment verification failed',
        status: 'FAILED',
      };
    }

    // ===================================================
    // PAYMENT SUCCESS
    // ===================================================

    const payment =
      await this.paymentModel.findOneAndUpdate(
        {
          razorpayOrderId,
        },
        {
          razorpayPaymentId,
          razorpaySignature,

          // Payment successfully completed
          status: 'SUCCESS',

          // Actual successful payment date and time
          paidAt: new Date(),
        },
        {
          new: true,
        },
      );

    if (!payment) {
      throw new NotFoundException(
        'Payment record not found',
      );
    }

    // ===================================================
    // UPDATE ORDER PAYMENT STATUS
    // ===================================================

    const order =
      await this.orderModel.findByIdAndUpdate(
        payment.orderId,
        {
          paymentStatus: 'Paid',
        },
        {
          new: true,
        },
      );

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    return {
      message: 'Payment verified successfully',
      payment,
      order,
    };
  }

  // =====================================================
  // GET PAYMENT STATUS
  // =====================================================

  async getPaymentStatus(orderId: string) {
    const payment =
      await this.paymentModel.findOne({
        orderId,
      });

    return {
      orderId,

      paymentStatus:
        payment?.status || 'NOT_FOUND',

      transactionId:
        payment?.razorpayPaymentId || null,

      paidAt:
        payment?.paidAt || null,
    };
  }
}