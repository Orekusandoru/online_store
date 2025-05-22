import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";

const OrderForm = () => {
  const { cart, clearCart } = useCart();
  const token = sessionStorage.getItem("token");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Підтягуємо дані користувача, якщо є токен
  useEffect(() => {
    if (token) {
      axios
        .get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const data = res.data as { user?: { email?: string; phone?: string; address?: string; name?: string } };
          const user = data.user || {};
          setUserData((prev) => ({
            ...prev,
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            name: user.name || "",
          }));
        })
        .catch(() => {});
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
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
        // Передаємо дані, якщо вони є
        orderPayload = { ...orderPayload, ...userData };
      } else {
        orderPayload = { ...orderPayload, ...userData };
      }
      const response = await axios.post("/api/orders", orderPayload, { headers });
      const data = response.data as { orderId?: string };
      alert(`Замовлення №${data.orderId || "?"} створено!`);
      clearCart();
      setUserData({ name: "", email: "", phone: "", address: "" });
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
    <form id="order" onSubmit={handleOrder} className="max-w-md mx-auto p-6 bg-main m-2 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-dark">Оформлення замовлення</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        className="input-main w-full mb-3"
        name="name"
        placeholder="Ім'я"
        value={userData.name}
        onChange={handleChange}
        required
      />
      <input
        className="input-main w-full mb-3"
        name="email"
        type="email"
        placeholder="Email"
        value={userData.email}
        onChange={handleChange}
        required
      />
      <input
        className="input-main w-full mb-3"
        name="phone"
        placeholder="Телефон"
        value={userData.phone}
        onChange={handleChange}
        required
      />
      <input
        className="input-main w-full mb-3"
        name="address"
        placeholder="Адреса доставки"
        value={userData.address}
        onChange={handleChange}
        required
      />
      <button
        type="submit"
        className="btn-main w-full"
        disabled={loading}
      >
        {loading ? "Оформлення..." : "Підтвердити замовлення"}
      </button>
    </form>
  );
};

export default OrderForm;
