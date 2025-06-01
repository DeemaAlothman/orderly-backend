export class CreateOrderItemDto {
  orderId: string;
  productId?: string;
  quantity: number;
  unit_price?: number;
  custom_notes?: string;
  is_custom_item: boolean;
  custom_item_name?: string;
}
