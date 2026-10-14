import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor() {

    super({

      // Header मधून token घेईल
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      // auth.module मधला same secret
      secretOrKey: 'MY_SECRET_KEY',

    });

  }


  async validate(payload: any) {

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

  }

}