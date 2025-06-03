import { Category } from "./category";

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  category_id: number; 
  image_url?: string;
  created_at?: Date;
  updated_at?: Date;
  category?: Category; 
  rating?: number;
  rating_count?: number;
  popularity?: number;
}