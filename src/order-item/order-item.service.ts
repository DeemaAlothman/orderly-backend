import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderItemService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderItemDto: CreateOrderItemDto) {
    const {
      orderId,
      productId,
      quantity,
      unit_price,
      custom_notes,
      is_custom_item,
      custom_item_name,
    } = createOrderItemDto;

    // التحقق من وجود الطلب والمنتج إذا لم يكن العنصر مخصصًا
    if (!is_custom_item) {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });
      if (!order) throw new NotFoundException(`الطلب رقم ${orderId} غير موجود`);

      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product)
        throw new NotFoundException(`المنتج رقم ${productId} غير موجود`);
    }

    // حساب السعر الكلي
    const unitPriceValue = is_custom_item ? 0 : (unit_price ?? 0); // إذا كان unit_price undefined، استخدم 0
    const total_price = quantity * unitPriceValue;

    // إنشاء العنصر
    const orderItem = await this.prisma.orderItem.create({
      data: {
        orderId,
        productId: is_custom_item ? null : productId,
        quantity,
        unit_price: new Decimal(unitPriceValue), // تحويل إلى Decimal
        total_price: new Decimal(total_price),
        custom_notes,
        is_custom_item,
        custom_item_name: is_custom_item ? custom_item_name : null,
        created_at: new Date(),
      },
    });

    // تحديث إجمالي سعر الطلب
    await this.updateOrderTotalPrice(orderId);

    return orderItem;
  }

  async findAll() {
    return this.prisma.orderItem.findMany({
      include: {
        order: true,
        product: true,
      },
    });
  }

  async findOne(id: string) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id },
      include: { order: true, product: true },
    });
    if (!orderItem)
      throw new NotFoundException(`عنصر الطلب رقم ${id} غير موجود`);
    return orderItem;
  }

  async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
    const orderItem = await this.prisma.orderItem.findUnique({ where: { id } });
    if (!orderItem)
      throw new NotFoundException(`عنصر الطلب رقم ${id} غير موجود`);

    const { quantity, unit_price, custom_notes, custom_item_name } =
      updateOrderItemDto;

    // إعادة حساب السعر الكلي إذا تم تحديث الكمية أو السعر
    const unitPriceValue = unit_price ?? Number(orderItem.unit_price); // تحويل Decimal إلى number
    const total_price = quantity
      ? quantity * unitPriceValue
      : orderItem.total_price;

    const updatedOrderItem = await this.prisma.orderItem.update({
      where: { id },
      data: {
        quantity: quantity ?? orderItem.quantity,
        unit_price: unit_price ? new Decimal(unit_price) : orderItem.unit_price,
        total_price: new Decimal(total_price),
        custom_notes: custom_notes ?? orderItem.custom_notes,
        custom_item_name: custom_item_name ?? orderItem.custom_item_name,
      },
    });

    // تحديث إجمالي سعر الطلب
    await this.updateOrderTotalPrice(orderItem.orderId);

    return updatedOrderItem;
  }

  async remove(id: string) {
    const orderItem = await this.prisma.orderItem.findUnique({ where: { id } });
    if (!orderItem)
      throw new NotFoundException(`عنصر الطلب رقم ${id} غير موجود`);

    await this.prisma.orderItem.delete({ where: { id } });

    // تحديث إجمالي سعر الطلب
    await this.updateOrderTotalPrice(orderItem.orderId);

    return { message: `تم حذف عنصر الطلب رقم ${id}` };
  }

  async setCustomItemPrice(id: string, unit_price: number) {
    const orderItem = await this.prisma.orderItem.findUnique({ where: { id } });
    if (!orderItem)
      throw new NotFoundException(`عنصر الطلب رقم ${id} غير موجود`);
    if (!orderItem.is_custom_item)
      throw new NotFoundException(`العنصر رقم ${id} ليس مخصصًا`);

    const total_price = orderItem.quantity * unit_price;

    const updatedOrderItem = await this.prisma.orderItem.update({
      where: { id },
      data: {
        unit_price: new Decimal(unit_price),
        total_price: new Decimal(total_price),
      },
    });

    // تحديث إجمالي سعر الطلب
    await this.updateOrderTotalPrice(orderItem.orderId);

    return updatedOrderItem;
  }

  private async updateOrderTotalPrice(orderId: string) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId },
    });

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException(`الطلب رقم ${orderId} غير موجود`);

    const baseAmount = order.base_amount; // 500 ل.س أو من PricingConfig
    const deliveryFee = order.delivery_fee;
    const customItemsAmount = orderItems
      .filter((item) => item.is_custom_item)
      .reduce((sum, item) => sum + Number(item.total_price), 0);
    const itemsTotal = orderItems
      .filter((item) => !item.is_custom_item)
      .reduce((sum, item) => sum + Number(item.total_price), 0);

    // السعر الكلي = base_amount + itemsTotal + customItemsAmount + delivery_fee
    const total_amount =
      Number(baseAmount) + itemsTotal + customItemsAmount + Number(deliveryFee);

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        total_amount: new Decimal(total_amount),
        custom_items_amount: new Decimal(customItemsAmount),
      },
    });
  }
}
