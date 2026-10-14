import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateAddressDto {
  @IsEnum(['Home', 'Work', 'Other'])
  type!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'Mobile number must be 10 digits',
  })
  mobile!: string;

  @IsString()
  @IsNotEmpty()
  houseNo!: string;

  @IsString()
  @IsNotEmpty()
  area!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @Matches(/^[0-9]{6}$/, {
    message: 'Pincode must be 6 digits',
  })
  pincode!: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}