export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    image_url: string;
    created_at: string;
    updated_at: string;
  };
  
  export type NewProduct = Omit<Product, "id" | "created_at" | "updated_at">;
  
  export type Category = {
    id: number;
    name: string;
  };
  
  export type NewCategory = Omit<Category, "id">;
  