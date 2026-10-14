import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,

    JwtModule.register({
      secret: 'MY_SECRET_KEY',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    JwtStrategy
  ],

  exports: [
    AuthService,
  ],
})
export class AuthModule {}