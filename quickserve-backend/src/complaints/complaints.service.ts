import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Complaint,
  ComplaintDocument,
  ComplaintStatus,
} from './schemas/complaint.schema';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectModel(Complaint.name)
    private readonly complaintModel: Model<ComplaintDocument>,
  ) {}

  // =====================================================
  // CREATE COMPLAINT
  // =====================================================

  async createComplaint(data: {
    customerId: string;
    restaurantId: string;
    orderId: string;
    subject: string;
    description: string;
    category: string;
  }) {
    const complaint = new this.complaintModel({
      customerId: new Types.ObjectId(data.customerId),
      restaurantId: new Types.ObjectId(data.restaurantId),
      orderId: new Types.ObjectId(data.orderId),
      subject: data.subject,
      description: data.description,
      category: data.category,
      status: ComplaintStatus.PENDING,
    });

    return complaint.save();
  }

  // =====================================================
  // GET ALL COMPLAINTS - ADMIN
  // =====================================================

  async getAllComplaints() {
    return this.complaintModel
      .find()
      .populate('customerId', 'name email')
      .populate('restaurantId', 'name')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .exec();
  }

  // =====================================================
  // GET RESTAURANT COMPLAINTS
  // =====================================================

  async getRestaurantComplaints(
    restaurantId: string,
  ) {
    return this.complaintModel
      .find({
        restaurantId: new Types.ObjectId(restaurantId),
      })
      .populate('customerId', 'name email')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .exec();
  }

  // =====================================================
  // GET CUSTOMER COMPLAINTS
  // =====================================================

  async getCustomerComplaints(
    customerId: string,
  ) {
    return this.complaintModel
      .find({
        customerId: new Types.ObjectId(customerId),
      })
      .populate('restaurantId', 'name')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .exec();
  }

  // =====================================================
  // GET SINGLE COMPLAINT
  // =====================================================

  async getComplaintById(id: string) {
    const complaint =
      await this.complaintModel
        .findById(id)
        .populate('customerId', 'name email')
        .populate('restaurantId', 'name')
        .populate('orderId')
        .exec();

    if (!complaint) {
      throw new NotFoundException(
        'Complaint not found',
      );
    }

    return complaint;
  }

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  async updateStatus(
    id: string,
    status: ComplaintStatus,
  ) {
    const complaint =
      await this.complaintModel.findByIdAndUpdate(
        id,
        {
          status,
        },
        {
          new: true,
        },
      );

    if (!complaint) {
      throw new NotFoundException(
        'Complaint not found',
      );
    }

    return complaint;
  }
}