export interface OrderItem {
    id?: number; 
    order_id: number; 
    product_id: number; 
    quantity: number; 
    price: number; 
}

export interface Order {
    id?: number; 
    user_id?: number; 
    total_price: number; 
    status?: "pending" | "confirmed" | "shipped" | "cancelled"; 
    name?: string;
    phone?: string;
    address?: string;
    created_at?: Date; 
    updated_at?: Date; 
    items?: OrderItem[]; 
}
