import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  mobile!: string;

  @MinLength(6)
  password!: string;
}