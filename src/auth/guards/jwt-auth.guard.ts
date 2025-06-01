// src/auth/guards/jwt-auth.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    console.log('🔍 تحقق JwtAuthGuard:', { user, info: info?.message });
    if (err || !user) {
      console.error('❌ فشل المصادقة:', { err, info: info?.message });
      throw err || new UnauthorizedException('غير مصادق');
    }
    return user;
  }
}
