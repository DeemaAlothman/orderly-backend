// src/order/order.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { NotificationService } from '../notification/notification.service';
import { PushNotificationService } from '../notification/push-notification.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private pushNotificationService: PushNotificationService,
  ) {}

  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async create(dto: CreateOrderDto, currentUserId: string) {
    // التحقق من وجود العنوان ونشاطه
    const address = await this.prisma.userAddress.findUnique({
      where: { id: dto.addressId },
    });
    if (!address) throw new NotFoundException('العنوان غير موجود');
    if (address.userId !== currentUserId) {
      throw new ForbiddenException('لا تملك صلاحية استخدام هذا العنوان');
    }
    if (!address.is_active) {
      throw new ForbiddenException('هذا العنوان غير نشط');
    }

    // التحقق من نوع التوصيل
    const deliveryType = await this.prisma.deliveryType.findUnique({
      where: { id: dto.delivery_type_id },
    });
    if (!deliveryType) throw new NotFoundException('نوع التوصيل غير موجود');

    // استرجاع قائمة عمال التوصيل المتاحين
    const deliveryStaffList = await this.prisma.deliveryStaff.findMany({
      where: { availability_status: 'متاح', is_active: true },
    });
    if (!deliveryStaffList.length) {
      throw new NotFoundException('لا يوجد عمال توصيل متاحين');
    }

    // إيجاد أقرب عامل توصيل بناءً على موقع العميل والعامل
    const closestStaff = deliveryStaffList.reduce(
      (prev, curr) => {
        const prevDist = this.calculateHaversineDistance(
          address.lat,
          address.long,
          prev.staff.lat,
          prev.staff.long,
        );
        const currDist = this.calculateHaversineDistance(
          address.lat,
          address.long,
          curr.lat,
          curr.long,
        );
        return currDist < prevDist ? { staff: curr, distance: currDist } : prev;
      },
      { staff: deliveryStaffList[0], distance: Infinity },
    );

    // تحديث حالة العامل الأقرب
    await this.prisma.deliveryStaff.update({
      where: { id: closestStaff.staff.id },
      data: { availability_status: 'مشغول' },
    });

    // تحويل القيم العددية
    const base_amount = new Decimal(dto.base_amount);
    const delivery_fee = new Decimal(dto.delivery_fee);
    const custom_items_amount = new Decimal(dto.custom_items_amount ?? 0);
    const total_amount = new Decimal(dto.total_amount);

    // إنشاء الطلب
    // إنشاء الطلب
    const order = await this.prisma.order.create({
      data: {
        customerId: currentUserId,
        staffId: closestStaff.staff.id,
        delivery_type_id: dto.delivery_type_id,
        order_status: dto.order_status,
        base_amount,

        delivery_fee,
        custom_items_amount,
        total_amount,
        customer_notes: dto.customer_notes,
        admin_notes: dto.admin_notes,
        order_date: dto.order_date,
        addressId: dto.addressId,
        created_at: new Date(),
      },
    });

    // 🔔 جلب توكن العميل من جدول DeviceToken
    const tokenRecord = await this.prisma.deviceToken.findFirst({
      where: { userId: currentUserId },
    });

    if (tokenRecord?.token) {
      const title = 'تم إنشاء طلبك بنجاح';
      const message = `طلبك رقم #${order.id} قيد التوصيل الآن`;

      // 1. إرسال إشعار Push عبر Firebase
      await this.pushNotificationService.sendNotification(
        tokenRecord.token,
        title,
        message,
      );

      // 2. حفظ الإشعار في جدول Notification
      await this.notificationService.create({
        userId: currentUserId,
        title,
        message,
        notification_type: 'ORDER_CREATED',
      });
    }

    return order;
  }

  async rejectOrder(orderId: string, staffId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { address: true },
    });

    if (!order) throw new NotFoundException('الطلب غير موجود');
    if (order.staffId !== staffId) {
      throw new ForbiddenException('لا تملك صلاحية رفض هذا الطلب');
    }

    const address = order.address;
    if (!address) {
      throw new NotFoundException('العنوان المرتبط بالطلب غير موجود');
    }

    // إعادة العامل الحالي إلى متاح
    await this.prisma.deliveryStaff.update({
      where: { id: staffId },
      data: { availability_status: 'متاح' },
    });

    // استبعاد العامل الرافض من القائمة
    const deliveryStaffList = await this.prisma.deliveryStaff.findMany({
      where: {
        availability_status: 'متاح',
        is_active: true,
        id: { not: staffId },
      },
    });

    if (!deliveryStaffList.length) {
      // تحديث الطلب إلى انتظار التعيين
      await this.prisma.order.update({
        where: { id: orderId },
        data: { staffId: null, order_status: OrderStatus.PENDING },
      });

      // إشعار العميل بعدم توفر سائق
      const tokenRecord = await this.prisma.deviceToken.findFirst({
        where: { userId: order.customerId },
      });

      if (tokenRecord?.token) {
        const title = 'تعذر تعيين سائق';
        const message = `طلبك رقم #${order.id} بانتظار تعيين سائق جديد.`;

        await this.pushNotificationService.sendNotification(
          tokenRecord.token,
          title,
          message,
        );
        await this.notificationService.create({
          userId: order.customerId,
          title,
          message,
          notification_type: 'ORDER_WAITING_DRIVER',
        });
      }

      throw new NotFoundException('لا يوجد عمال توصيل متاحين حاليًا');
    }

    // إيجاد أقرب عامل جديد
    const nextClosestStaff = deliveryStaffList.reduce(
      (prev, curr) => {
        const prevDist = this.calculateHaversineDistance(
          address.lat,
          address.long,
          prev.staff.lat,
          prev.staff.long,
        );
        const currDist = this.calculateHaversineDistance(
          address.lat,
          address.long,
          curr.lat,
          curr.long,
        );
        return currDist < prevDist ? { staff: curr, distance: currDist } : prev;
      },
      { staff: deliveryStaffList[0], distance: Infinity },
    );

    // تحديث العامل الجديد إلى مشغول
    await this.prisma.deliveryStaff.update({
      where: { id: nextClosestStaff.staff.id },
      data: { availability_status: 'مشغول' },
    });

    // تحديث الطلب
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        staffId: nextClosestStaff.staff.id,
        order_status: OrderStatus.ASSIGNED,
      },
    });

    // إشعار العميل بتعيين سائق جديد
    const tokenRecord = await this.prisma.deviceToken.findFirst({
      where: { userId: order.customerId },
    });

    if (tokenRecord?.token) {
      const title = 'تم تعيين سائق جديد';
      const message = `تم تعيين عامل توصيل جديد لطلبك رقم #${order.id}`;

      await this.pushNotificationService.sendNotification(
        tokenRecord.token,
        title,
        message,
      );
      await this.notificationService.create({
        userId: order.customerId,
        title,
        message,
        notification_type: 'ORDER_REASSIGNED',
      });
    }

    return updatedOrder;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        customer: true,
        staff: true,
        deliveryType: true,
        address: true,
        items: true,
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        staff: true,
        deliveryType: true,
        address: true,
        items: true,
      },
    });
    if (!order) throw new NotFoundException('الطلب غير موجود');
    return order;
  }

  async update(id: string, dto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('الطلب غير موجود');

    const data: any = { ...dto };

    if (dto.base_amount) data.base_amount = new Decimal(dto.base_amount);
    if (dto.delivery_fee) data.delivery_fee = new Decimal(dto.delivery_fee);
    if (dto.custom_items_amount)
      data.custom_items_amount = new Decimal(dto.custom_items_amount);
    if (dto.total_amount) data.total_amount = new Decimal(dto.total_amount);

    // ✅ تحديث الطلب
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data,
    });

    // ✅ إذا تغيرت حالة الطلب، نرسل إشعار
    if (dto.order_status) {
      const tokenRecord = await this.prisma.deviceToken.findFirst({
        where: { userId: order.customerId },
      });

      if (tokenRecord?.token) {
        const title = 'تحديث حالة الطلب';
        const message = `تم تغيير حالة طلبك رقم #${order.id} إلى: ${dto.order_status}`;

        await this.pushNotificationService.sendNotification(
          tokenRecord.token,
          title,
          message,
        );

        await this.notificationService.create({
          userId: order.customerId,
          title,
          message,
          notification_type: 'ORDER_STATUS_UPDATED',
        });
      }
    }

    return updatedOrder;
  }

  async remove(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('الطلب غير موجود');

    return this.prisma.order.delete({
      where: { id },
    });
  }
}
