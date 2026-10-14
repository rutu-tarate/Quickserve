import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
  ) {}

  // =========================================
  // ADD ADDRESS
  // =========================================

  @Post()
  create(
    @Req() req: any,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.create(
      req.user.id,
      dto,
    );
  }

  // =========================================
  // GET MY ADDRESSES
  // =========================================

  @Get()
  findMyAddresses(@Req() req: any) {
    return this.addressService.findMyAddresses(
      req.user.id,
    );
  }

  // =========================================
  // GET SINGLE ADDRESS
  // =========================================

  @Get(':id')
  findOne(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.addressService.findOne(
      req.user.id,
      id,
    );
  }

  // =========================================
  // SET DEFAULT
  // =========================================

  @Patch(':id/default')
  setDefault(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.addressService.setDefault(
      req.user.id,
      id,
    );
  }

  // =========================================
  // DELETE
  // =========================================

  @Delete(':id')
  remove(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.addressService.remove(
      req.user.id,
      id,
    );
  }
}