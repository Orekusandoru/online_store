import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (product_id: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      axios
        .get<{ items: CartItem[] }>("/api/cart", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setCart(res.data.items || []);
          setInitialized(true);
        })
        .catch(() => {
          setCart([]);
          setInitialized(true);
        });
    } else {
      const local = localStorage.getItem("cart");
      setCart(local ? JSON.parse(local) : []);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    
    if (!initialized) return;
    const token = sessionStorage.getItem("token");
    if (token) {
      const safeCart = Array.isArray(cart)
        ? cart.map(item => ({
            ...item,
            price: typeof item.price === "string" ? Number(item.price) : item.price,
            quantity: typeof item.quantity === "string" ? Number(item.quantity) : item.quantity,
          }))
        : [];
      axios.post(
        "/api/cart",
        { items: safeCart },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, initialized]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === item.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (product_id: number) => {
    setCart((prev) => prev.filter((item) => item.product_id !== product_id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
