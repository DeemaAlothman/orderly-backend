// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(phone: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByPhone(phone);
      console.log('🔍 تحقق المستخدم:', { phone, found: !!user });
      if (!user) return null;

      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('🔒 نتيجة مقارنة كلمة المرور:', isPasswordValid);
      if (!isPasswordValid || !user.is_active) return null;

      user.lastLogin = new Date();
      await this.userService.update(user.id, { lastLogin: user.lastLogin });

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      console.error('❌ خطأ في validateUser:', error);
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    console.log('📥 طلب تسجيل دخول:', loginDto);
    const user = await this.validateUser(loginDto.phone, loginDto.password);
    if (!user) {
      console.error('❌ فشل تسجيل الدخول: بيانات غير صحيحة');
      throw new UnauthorizedException('رقم الهاتف أو كلمة المرور غير صحيح');
    }

    const payload = {
      sub: user.id,
      phone: user.phone,
      type: user.type,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        type: user.type,
        name: user.name,
      },
    };
  }

  async loginWithOtp(loginDto: LoginDto) {
    console.log('📥 طلب تسجيل دخول بـ OTP:', loginDto);
    const user = await this.userService.findByPhone(loginDto.phone);
    if (!user) throw new UnauthorizedException('رقم الهاتف غير صحيح');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 دقائق

    await this.prisma.otpVerification.create({
      data: {
        id: uuidv4(),
        phone: loginDto.phone,
        code: otp,
        expires_at: expires,
      },
    });

    try {
      await axios.post('https://anycode-sy.com/otp-service/send-otp', {
        phoneNumber: loginDto.phone,
        otp,
      });
      console.log('📤 تم إرسال OTP:', otp);
    } catch (error) {
      console.error('❌ خطأ في إرسال OTP:', error.message);
      throw new BadRequestException('فشل إرسال رمز التحقق');
    }

    return { message: 'تم إرسال رمز التحقق إلى رقم الهاتف', otp }; // للاختبار فقط
  }

  async verifyOtpAndLogin(phone: string, otp: string, password: string) {
    console.log('📥 تحقق OTP لتسجيل الدخول:', { phone, otp });
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        phone,
        code: otp,
        verified: false,
        expires_at: { gt: new Date() },
      },
    });

    if (!record) {
      console.error('❌ رمز OTP غير صالح أو منتهي:', { phone, otp });
      throw new BadRequestException('رمز التحقق غير صالح أو منتهي');
    }

    const user = await this.validateUser(phone, password);
    if (!user) {
      console.error('❌ فشل التحقق من المستخدم:', { phone });
      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });
    console.log('✅ تم تحديث حالة OTP إلى verified');

    const payload = {
      sub: user.id,
      phone: user.phone,
      type: user.type,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        type: user.type,
        name: user.name,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    console.log('📥 طلب تسجيل:', createUserDto);
    if (
      !createUserDto.phone ||
      !createUserDto.password ||
      !createUserDto.name
    ) {
      throw new BadRequestException(
        'الحقول المطلوبة (رقم الهاتف، كلمة المرور، الاسم) ناقصة',
      );
    }

    // تحقق إذا كان المستخدم موجود مسبقًا
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: createUserDto.phone },
    });
    if (existingUser) {
      throw new BadRequestException('رقم الهاتف مسجل مسبقًا');
    }

    // إنشاء كلمة مرور مشفرة
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // إنشاء المستخدم في جدول user بحالة غير مفعلة
    const user = await this.prisma.user.create({
      data: {
        phone: createUserDto.phone,
        name: createUserDto.name,
        password: hashedPassword,
        type: createUserDto.type || 'CUSTOMER',
        address: createUserDto.address || null,
        is_active: false, // الحساب غير مفعل حتى التحقق من OTP
        is_verified: false, // يمكن أن يظل غير موكد حتى التحقق
      },
    });

    // إنشاء رمز OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    try {
      await this.prisma.otpVerification.create({
        data: {
          id: uuidv4(),
          phone: createUserDto.phone,
          code: otp,
          expires_at: expires,
        },
      });
      console.log('✅ تم إنشاء OTP في قاعدة البيانات:', otp);

      await axios.post('https://anycode-sy.com/otp-service/send-otp', {
        phoneNumber: createUserDto.phone,
        otp,
      });
      console.log('📤 تم إرسال الكود عبر API');

      return {
        message: 'تم إرسال رمز التحقق، يرجى إدخال الكود لإتمام التسجيل',
        otp, // للاختبار فقط
      };
    } catch (error) {
      // في حالة فشل إرسال OTP، يمكننا حذف المستخدم المؤقت لتجنب بقاء بيانات غير مكتملة
      await this.prisma.user.delete({ where: { id: user.id } });
      console.error('❌ خطأ أثناء إنشاء OTP أو الإرسال:', error.message);
      throw new BadRequestException('حدث خطأ أثناء معالجة الطلب');
    }
  }

  async verifyOtpAndRegister(
    phone: string,
    otp: string,
    dto: Partial<CreateUserDto>,
  ) {
    console.log('📥 تحقق OTP للتفعيل:', { phone, otp, dto });

    // التحقق من وجود OTP صالح
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        phone,
        code: otp,
        verified: false,
        expires_at: { gt: new Date() },
      },
    });

    if (!record) {
      console.error('❌ رمز OTP غير صالح أو منتهي:', { phone, otp });
      throw new BadRequestException('رمز التحقق غير صالح أو منتهي');
    }

    // التحقق من وجود المستخدم
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });
    if (!user) {
      console.error('❌ المستخدم غير موجود:', { phone });
      throw new BadRequestException('رقم الهاتف غير مسجل');
    }

    // تحديث حالة المستخدم إلى مفعل
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        is_active: true,
        is_verified: true,
      },
    });

    // تحديث حالة سجل OTP إلى verified
    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    console.log('✅ تم تفعيل الحساب');

    const { password, ...userData } = updatedUser;
    return { message: 'تم إنشاء الحساب وتفعيله بنجاح', user: userData };
  }

  async sendResetPasswordOtp(phone: string) {
    console.log('📥 طلب إعادة تعيين كلمة المرور:', phone);
    const user = await this.userService.findByPhone(phone);
    if (!user) {
      console.error('❌ رقم الهاتف غير مسجل:', phone);
      throw new BadRequestException('رقم الهاتف غير مسجل');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: {
        id: uuidv4(),
        phone,
        code: otp,
        expires_at: expires,
      },
    });

    try {
      await axios.post('https://anycode-sy.com/otp-service/send-otp', {
        phoneNumber: phone,
        otp,
      });
      console.log('📤 تم إرسال OTP لإعادة تعيين كلمة المرور:', otp);
    } catch (error) {
      console.error('❌ خطأ في إرسال OTP:', error.message);
      throw new BadRequestException('فشل إرسال رمز التحقق');
    }

    return { message: 'تم إرسال رمز إعادة تعيين كلمة المرور', otp }; // للاختبار فقط
  }

  async resetPassword(phone: string, otp: string, newPassword: string) {
    console.log('📥 إعادة تعيين كلمة المرور:', { phone, otp });
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        phone,
        code: otp,
        verified: false,
        expires_at: { gt: new Date() },
      },
    });

    if (!record) {
      console.error('❌ رمز OTP غير صالح أو منتهي:', { phone, otp });
      throw new BadRequestException('رمز التحقق غير صالح أو منتهي');
    }

    const user = await this.userService.findByPhone(phone);
    if (!user) {
      console.error('❌ رقم الهاتف غير مسجل:', phone);
      throw new BadRequestException('رقم الهاتف غير مسجل');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.update(user.id, { password: hashedPassword });
    console.log('✅ تم تحديث كلمة المرور');

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });
    console.log('✅ تم تحديث حالة OTP إلى verified');

    return { message: 'تم إعادة تعيين كلمة المرور بنجاح' };
  }
}
