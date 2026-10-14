import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  foodName!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  @IsNotEmpty()
  restaurantId!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;
}