export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    image_url: string;
    created_at: string;
    updated_at: string;
    screen_size?: number;
    resolution?: string;
    ram?: number;
    storage?: number;
    processor?: string;
    battery?: number;
    refresh_rate?: number;
  };
  
  export type NewProduct = Omit<Product, "id" | "created_at" | "updated_at">;
  
  export type Category = {
    id: number;
    name: string;
  };
  
  export type NewCategory = Omit<Category, "id">;

