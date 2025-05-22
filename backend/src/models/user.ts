export interface User {
  id?: number;
  email: string;
  password: string;
  role?: "user" | "admin" | "seller";
  name?: string; 
  phone?: string;
  address?: string;
  created_at?: Date;
  updated_at?: Date;
}