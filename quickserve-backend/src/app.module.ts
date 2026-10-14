import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuModule } from './menu/menu.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';
import { DeliveryModule } from './delivery/delivery.module';
import { AdminModule } from './admin/admin.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { CouponsModule } from './coupons/coupons.module';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI!),

    UsersModule,

    AuthModule,

    RestaurantsModule,

    MenuModule,

    CartModule,

    OrdersModule,

    PaymentModule,

    DeliveryModule,

    AdminModule,

    ComplaintsModule,

    CouponsModule,

    AddressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}