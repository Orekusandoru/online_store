import { useEffect, useState } from "react";
import axios from "axios";

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  user_id?: number;
  total_price: number;
  status: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const DashboardOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [statusUpdates, setStatusUpdates] = useState<Record<number, string>>({});

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    axios
      .get<Order[]>("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data))
      .catch(() => setError("Не вдалося отримати замовлення"));
  }, []);

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setStatusUpdates((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  const handleUpdateStatus = async (orderId: number) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    const newStatus = statusUpdates[orderId];
    try {
      await axios.put(
        `/api/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch {
      setError("Не вдалося оновити статус замовлення");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-accent drop-shadow">Всі замовлення</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {orders.length === 0 && <p className="text-center text-lg">Замовлень немає</p>}
      <ul className="space-y-6">
        {orders.map((order) => (
          <li
            key={order.id}
            className="bg-dark text-white rounded-xl shadow-lg border border-accent/30 hover:shadow-2xl transition-shadow duration-200 p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <span className="font-bold text-accent">№{order.id}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="font-semibold">Статус:</span>
                <select
                  value={statusUpdates[order.id] ?? order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="select-main mx-2 bg-dark text-white border-accent focus:ring-accent"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status} className="bg-dark text-white">
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-main ml-2 px-3 py-1 text-sm shadow hover:scale-105 transition-transform"
                  onClick={() => handleUpdateStatus(order.id)}
                  disabled={
                    (statusUpdates[order.id] ?? order.status) === order.status
                  }
                >
                  Оновити статус
                </button>
              </div>
              <div>
                <div>
                  <span className="font-semibold text-accent">Телефон:</span>
                  <span className="ml-2">{order.phone || "-"}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">Адреса:</span>
                  <span className="ml-2">{order.address || "-"}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">Створено:</span>
                  <span className="ml-2">{new Date(order.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <span className="font-semibold text-accent">Товари:</span>
              <ul className="ml-4 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {order.items.map((item) => (
                  <li key={item.id} className="bg-dark text-white mb-1 p-1 rounded border border-accent/20">
                    <span className="font-semibold">ID товару:</span> {item.product_id},{" "}
                    <span className="font-semibold">Кількість:</span> {item.quantity},{" "}
                    <span className="font-semibold">Ціна:</span> {item.price}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardOrders;
