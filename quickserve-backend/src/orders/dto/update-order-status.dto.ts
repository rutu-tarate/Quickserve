import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn([
    'Pending',
    'Accepted',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ])
  status!: string;
}