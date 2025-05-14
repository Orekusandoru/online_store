export interface User {
  id?: number;
  email: string;
  password: string;
  role?: "user" | "admin" | "seller";
  phone?: string;
  address?: string;
  created_at?: Date;
  updated_at?: Date;
}