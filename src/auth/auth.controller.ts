// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Patch, // أضف Patch
  UseGuards,
  BadRequestException,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateProfileDto } from '../user/dto/update-user-profile.dto'; // أضف DTO
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('login-with-otp')
  sendOtpForLogin(@Body() loginDto: LoginDto) {
    console.log('📥 طلب إرسال OTP لتسجيل الدخول:', loginDto);
    if (!loginDto.phone) {
      throw new BadRequestException('رقم الهاتف مطلوب');
    }
    return this.authService.loginWithOtp(loginDto);
  }

  @Post('verify-login')
  verifyLogin(@Body() dto: { phone: string; code: string; password: string }) {
    console.log('📥 البيانات المستلمة في verify-login:', dto);
    if (!dto.phone || !dto.code || !dto.password) {
      throw new BadRequestException('الحقول المطلوبة غير مكتملة');
    }
    return this.authService.verifyOtpAndLogin(
      dto.phone,
      dto.code,
      dto.password,
    );
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  @Post('verify-register')
  async verifyRegister(
    @Body() dto: { phone: string; code: string; user: Partial<CreateUserDto> },
  ) {
    const { phone, code, user } = dto;

    if (!phone || !code || !user) {
      throw new BadRequestException('بيانات الطلب ناقصة');
    }

    return this.authService.verifyOtpAndRegister(phone, code, user);
  }
  @Post('verify-otp')
  async verifyOtp(
    @Body('phone') phone: string,
    @Body('otp') otp: string,
    @Body() dto: Partial<CreateUserDto>,
  ) {
    if (!phone || !otp) {
      throw new BadRequestException('رقم الهاتف ورمز OTP مطلوبان');
    }
    return this.authService.verifyOtpAndRegister(phone, otp, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    console.log('📥 طلب الملف الشخصي:', { userId: req.user?.sub });
    if (!req.user?.sub) {
      console.error('❌ معرف المستخدم غير موجود في req.user');
      throw new UnauthorizedException('فشل المصادقة: معرف المستخدم غير موجود');
    }
    const user = await this.userService.findOne(req.user.sub);
    const { password, ...userData } = user;
    return userData;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile') // نقطة نهاية جديدة
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    console.log('📥 طلب تحديث الملف الشخصي:', { userId: req.user?.sub, dto });
    if (!req.user?.sub) {
      console.error('❌ معرف المستخدم غير موجود في req.user');
      throw new UnauthorizedException('فشل المصادقة: معرف المستخدم غير موجود');
    }
    if (dto.newPassword || dto.confirmNewPassword || dto.currentPassword) {
      if (!dto.currentPassword || !dto.newPassword || !dto.confirmNewPassword) {
        throw new BadRequestException(
          'يرجى ملء كل الحقول المتعلقة بكلمة المرور لتغييرها',
        );
      }
      if (dto.newPassword !== dto.confirmNewPassword) {
        throw new BadRequestException(
          'كلمة المرور الجديدة وتأكيدها غير متطابقين',
        );
      }
    }
    return this.userService.updateProfile(req.user.sub, dto);
  }

  @Post('logout')
  logout() {
    return {
      message: 'تم تسجيل الخروج بنجاح. يرجى حذف التوكن من الواجهة الأمامية.',
    };
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: { phone: string }) {
    console.log('📥 طلب إعادة تعيين كلمة المرور:', dto);
    if (!dto.phone) {
      throw new BadRequestException('رقم الهاتف مطلوب');
    }
    return this.authService.sendResetPasswordOtp(dto.phone);
  }

  @Post('reset-password')
  resetPassword(
    @Body() dto: { phone: string; code: string; newPassword: string },
  ) {
    console.log('📥 طلب إعادة تعيين كلمة المرور:', dto);
    if (!dto.phone || !dto.code || !dto.newPassword) {
      throw new BadRequestException('الحقول المطلوبة غير مكتملة');
    }
    return this.authService.resetPassword(dto.phone, dto.code, dto.newPassword);
  }
}
