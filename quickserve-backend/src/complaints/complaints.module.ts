import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Complaint,
  ComplaintSchema,
} from './schemas/complaint.schema';

import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Complaint.name,
        schema: ComplaintSchema,
      },
    ]),
  ],

  controllers: [ComplaintsController],

  providers: [ComplaintsService],

  exports: [ComplaintsService],
})
export class ComplaintsModule {}