import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}


  // Register API
  async register(registerDto: RegisterDto) {

    const emailExists = await this.usersService.findByEmail(
      registerDto.email,
    );

    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }


    const mobileExists = await this.usersService.findByMobile(
      registerDto.mobile,
    );

    if (mobileExists) {
      throw new BadRequestException('Mobile already exists');
    }


    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      10,
    );


    const user = await this.usersService.createUser({
      ...registerDto,
      password: hashedPassword,
    });


    return {
      message: 'Registration Successful',
      user,
    };
  }



  // Login API
  async login(loginDto: LoginDto) {

    const user = await this.usersService.findByEmail(
      loginDto.email,
    );


    if (!user) {
      throw new UnauthorizedException(
        'Invalid Email or Password',
      );
    }


    const isMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );


    if (!isMatch) {
      throw new UnauthorizedException(
        'Invalid Email or Password',
      );
    }



    // JWT Payload
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };


    const token = this.jwtService.sign(payload);



    return {
      message: 'Login Successful',
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    };
  }
}