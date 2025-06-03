export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    image_url: string;
    created_at: string;
    updated_at: string;
    rating: number;
    rating_count: number;
    popularity: number;
    screen_size?: number;
    resolution?: string;
    ram?: number;
    storage?: number;
    processor?: string;
    battery?: number;
    refresh_rate?: number;
  };
  
  export type NewProduct = Omit<Product, "id" | "created_at" | "updated_at" | "rating" | "rating_count" | "popularity">;
  
  export type Category = {
    id: number;
    name: string;
  };
  
  export type NewCategory = Omit<Category, "id">;

