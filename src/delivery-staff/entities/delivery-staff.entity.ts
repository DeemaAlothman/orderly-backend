// src/delivery-staff/entities/delivery-staff.entity.ts
export class DeliveryStaffEntity {
  id: string;
  userId: string;
  vehicle_type: string;
  availability_status: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
