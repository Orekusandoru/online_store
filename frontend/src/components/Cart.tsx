// src/components/Cart.tsx
import axios from "axios";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, clearCart, removeFromCart } = useCart();
  
  const handleOrder = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return alert("Авторизуйтесь, щоб зробити замовлення");

    try {
      interface OrderResponse {
        orderId: number;
      }

      const response = await axios.post<OrderResponse>(
        "/api/orders",
        { items: cart },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`Замовлення №${response.data.orderId} створено`);
      clearCart();
    } catch (error) {
      alert("Не вдалося створити замовлення");
    }
  };

  return (
    <div className="mb-6 border p-4 rounded shadow bg-main">
      <h2 className="text-xl font-bold text-dark">Кошик</h2>
      {cart.length === 0 && <p>Кошик порожній</p>}
      <ul>
        {cart.map((item) => (
          <li key={item.product_id} className="flex justify-between items-center">
            <span className="text-dark">
              {item.name} — {item.quantity} x {item.price} грн
            </span>
            <button
              onClick={() => removeFromCart(item.product_id)}
              className="btn-outline m-1"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
      {cart.length > 0 && (
        <>
          <div className="mt-4 text-lg font-semibold text-accent">
            Сума замовлення:{" "}
            {cart.reduce((total, item) => total + item.quantity * item.price, 0)}{" "}
            грн
          </div>
          <button
            onClick={handleOrder}
            className="btn-main mt-2"
          >
            Оформити замовлення
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
