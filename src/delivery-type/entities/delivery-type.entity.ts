// src/delivery-type/entities/delivery-type.entity.ts
export class DeliveryTypeEntity {
  id: string;
  type_name: string;
  description?: string;
  delivery_fee: string;
  is_active: boolean;
}
