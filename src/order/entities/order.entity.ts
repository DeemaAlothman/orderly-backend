// src/order/entities/order.entity.ts
export class OrderEntity {
  id: string;
  customerId: string;
  staffId?: string;
  delivery_type_id: string;
  order_status: string;
  base_amount: number;
  delivery_fee: number;
  custom_items_amount?: number;
  total_amount: number;
  customer_notes?: string;
  admin_notes?: string;
  order_date: Date;
  confirmed_at?: Date;
  picked_up_at?: Date;
  delivered_at?: Date;
  created_at: Date;
  updated_at: Date;
}
