// src/components/Cart.tsx
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

type CartProps = {
  onClose?: () => void;
};

const Cart = ({ onClose }: CartProps) => {
  const { cart, clearCart, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleGoToOrder = () => {
    if (onClose) onClose();
    navigate("/order");
  };

  return (
    <div className="mb-6 border p-4 rounded shadow bg-main">
      <h2 className="text-xl font-bold text-dark">Кошик</h2>
      {cart.length === 0 && <p className="text-dark">Кошик порожній</p>}
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
            onClick={handleGoToOrder}
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
