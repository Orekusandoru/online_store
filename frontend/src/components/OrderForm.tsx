import { useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";

const OrderForm = () => {
  const { cart, clearCart } = useCart();
  const token = sessionStorage.getItem("token");
  const [guestData, setGuestData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestData({ ...guestData, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let orderPayload: any = { items: cart };
      let headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        orderPayload = { ...orderPayload, ...guestData };
      }
      const response = await axios.post("/api/orders", orderPayload, { headers });
      const data = response.data as { orderId?: string };
      alert(`Замовлення №${data.orderId || "?"} створено!`);
      clearCart();
      setGuestData({ name: "", email: "", phone: "", address: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Не вдалося оформити замовлення");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return <div className="p-4">Кошик порожній</div>;
  }

  return (
    <form onSubmit={handleOrder} className="max-w-md mx-auto p-6 bg-gradient-to-l bg-gray-500 m-2 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Оформлення замовлення</h2>
      {error && <p className="text-red-500">{error}</p>}
      {!token && (
        <>
          <input
            className="border p-2 w-full mb-3"
            name="name"
            placeholder="Ім'я"
            value={guestData.name}
            onChange={handleChange}
            required
          />
          <input
            className="border p-2 w-full mb-3"
            name="email"
            type="email"
            placeholder="Email"
            value={guestData.email}
            onChange={handleChange}
            required
          />
          <input
            className="border p-2 w-full mb-3"
            name="phone"
            placeholder="Телефон"
            value={guestData.phone}
            onChange={handleChange}
            required
          />
          <input
            className="border p-2 w-full mb-3"
            name="address"
            placeholder="Адреса доставки"
            value={guestData.address}
            onChange={handleChange}
            required
          />
        </>
      )}
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? "Оформлення..." : "Підтвердити замовлення"}
      </button>
    </form>
  );
};

export default OrderForm;
