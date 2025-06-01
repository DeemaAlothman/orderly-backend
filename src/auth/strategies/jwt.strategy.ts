// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret', // استخدم .env
    });
  }

  async validate(payload: { sub: string; phone: string; type: string }) {
    console.log('🔍 تحقق الـ JWT payload:', payload);
    if (!payload.sub) {
      console.error('❌ معرف المستخدم غير موجود في الـ payload');
      throw new UnauthorizedException('بيانات التوكن غير صالحة');
    }
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      console.error('❌ المستخدم غير موجود:', payload.sub);
      throw new UnauthorizedException('المستخدم غير موجود');
    }
    return { sub: payload.sub, phone: payload.phone, type: payload.type };
  }
}
