// src/category/entities/category.entity.ts
export class CategoryEntity {
  id: string;
  name_ar: string;
  name_en: string;
  description?: string;
  icon_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

