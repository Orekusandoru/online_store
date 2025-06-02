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
    <div className=" border border-[#609966] p-4 rounded-xl shadow bg-[#EDF1D6] text-[#40513B]">
      <h2 className="text-xl font-bold mb-4 bg-[#609966] text-[#EDF1D6] rounded-lg px-3 py-2">
        Кошик
      </h2>
      {cart.length === 0 && <p className="text-[#40513B]">Кошик порожній</p>}
      <ul className="divide-y divide-[#9DC08B] mb-4">
        {cart.map((item) => (
          <li
            key={item.product_id}
            className="flex justify-between items-center py-2"
          >
            <span>
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
          <div className="mt-4 text-lg font-semibold text-[#609966]">
            Сума замовлення:{" "}
            {cart.reduce(
              (total, item) => total + item.quantity * item.price,
              0
            )}{" "}
            грн
          </div>
          <button
            onClick={handleGoToOrder}
            className="btn-main mt-4 w-full"
          >
            Оформити замовлення
          </button>
          <button
            onClick={clearCart}
            className="btn-outline mt-2 w-full"
          >
            Очистити кошик
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
