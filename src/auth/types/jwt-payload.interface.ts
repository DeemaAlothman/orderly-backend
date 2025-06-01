// src/auth/types/jwt-payload.interface.ts

export interface JwtPayload {
  sub: string; // user ID
  phone: string;
  type: 'ADMIN' | 'CUSTOMER' | 'DELIVERY_STAFF';
}
