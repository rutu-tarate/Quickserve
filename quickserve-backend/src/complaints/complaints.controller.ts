import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ComplaintsService,
} from './complaints.service';

import {
  ComplaintStatus,
} from './schemas/complaint.schema';

@Controller('complaints')
export class ComplaintsController {
  constructor(
    private readonly complaintsService: ComplaintsService,
  ) {}

  // =====================================================
  // CREATE COMPLAINT
  // =====================================================

  @Post()
  async createComplaint(
    @Body()
    body: {
      customerId: string;
      restaurantId: string;
      orderId: string;
      subject: string;
      description: string;
      category: string;
    },
  ) {
    return this.complaintsService.createComplaint(body);
  }

  // =====================================================
  // GET ALL COMPLAINTS - ADMIN
  // =====================================================

  @Get()
  async getAllComplaints() {
    return this.complaintsService.getAllComplaints();
  }

  // =====================================================
  // GET RESTAURANT COMPLAINTS
  // =====================================================

  @Get('restaurant/:restaurantId')
  async getRestaurantComplaints(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.complaintsService.getRestaurantComplaints(
      restaurantId,
    );
  }

  // =====================================================
  // GET CUSTOMER COMPLAINTS
  // =====================================================

  @Get('customer/:customerId')
  async getCustomerComplaints(
    @Param('customerId') customerId: string,
  ) {
    return this.complaintsService.getCustomerComplaints(
      customerId,
    );
  }

  // =====================================================
  // GET SINGLE COMPLAINT
  // =====================================================

  @Get(':id')
  async getComplaintById(
    @Param('id') id: string,
  ) {
    return this.complaintsService.getComplaintById(id);
  }

  // =====================================================
  // UPDATE COMPLAINT STATUS
  // =====================================================

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,

    @Body()
    body: {
      status: ComplaintStatus;
    },
  ) {
    return this.complaintsService.updateStatus(
      id,
      body.status,
    );
  }
}