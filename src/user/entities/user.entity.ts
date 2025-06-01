// src/user/entities/user.entity.ts
import { UserType } from '../../common/enums/user-type.enum';

export class UserEntity {
  id: string;
  name: string;
  phone: string;
  address?: string;
  type: UserType;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}