import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRestaurantDto {
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  owner!: string;

  @IsNotEmpty()
  address!: string;

  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  image!: string;
}