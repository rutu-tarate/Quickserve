import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  mobile!: string;

  @MinLength(6)
  password!: string;
}