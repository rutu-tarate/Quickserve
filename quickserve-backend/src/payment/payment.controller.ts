import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { PaymentService } from './payment.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  @Post('create')
  createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(
      createPaymentDto.orderId,
    );
  }

  // =====================================================
  // VERIFY PAYMENT
  // =====================================================

  @Post('verify')
  verifyPayment(
    @Body() verifyPaymentDto: VerifyPaymentDto,
  ) {
    return this.paymentService.verifyPayment(
      verifyPaymentDto.razorpayPaymentId,
      verifyPaymentDto.razorpayOrderId,
      verifyPaymentDto.razorpaySignature,
    );
  }

  // =====================================================
  // GET PAYMENT STATUS
  // =====================================================

  @Get(':orderId')
  getPaymentStatus(
    @Param('orderId') orderId: string,
  ) {
    return this.paymentService.getPaymentStatus(
      orderId,
    );
  }
}