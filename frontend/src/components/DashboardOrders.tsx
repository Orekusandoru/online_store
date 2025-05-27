import { useEffect, useState } from "react";
import axios from "axios";

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name?: string;
  category_name?: string;
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
  "paid", 
  "shipped",
  "delivered",
  "cancelled",
];

const DashboardOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [statusUpdates, setStatusUpdates] = useState<Record<number, string>>({});
  const [loadingStatus, setLoadingStatus] = useState<Record<number, boolean>>({});
  const [deleting, setDeleting] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    try {

      const res = await axios.get<Order[]>("/api/orders-details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch {
      setError("Не вдалося отримати замовлення");
    }
  };

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


  const handleCheckLiqPayStatus = async (orderId: number) => {
    setLoadingStatus((prev) => ({ ...prev, [orderId]: true }));
    try {
    
      const res = await axios.post<{ status: string }>("/api/liqpay-callback", { orderId });
      const liqpayStatus = res.data.status;
      if (liqpayStatus === "success") {
        await handleUpdateStatusToPaid(orderId);
      } else {
        alert("Статус LiqPay: " + liqpayStatus);
      }
    } catch {
      setError("Не вдалося перевірити статус LiqPay");
    } finally {
      setLoadingStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleUpdateStatusToPaid = async (orderId: number) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    try {
      await axios.put(
        `/api/orders/${orderId}`,
        { status: "paid" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "paid" } : order
        )
      );
    } catch {
      setError("Не вдалося оновити статус на paid");
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    if (!window.confirm("Ви впевнені, що хочете видалити це замовлення?")) return;
    setDeleting((prev) => ({ ...prev, [orderId]: true }));
    try {
      await axios.delete(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch {
      setError("Не вдалося видалити замовлення");
    } finally {
      setDeleting((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <div className="max-w-fit mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-accent drop-shadow">Всі замовлення</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {orders.length === 0 && <p className="text-center text-lg">Замовлень немає</p>}
      <ul className="space-y-3">
        {orders.map((order) => (
          <li
            key={order.id}
            className="bg-dark text-white rounded-xl shadow-lg border border-accent/30 hover:shadow-2xl transition-shadow duration-200 p-8 flex flex-col gap-4"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-accent text-xl">№{order.id}</span>
                  <span className="text-gray-400">|</span>
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
                    className="btn-outline  ml-2 px-3 py-1 border text-sm shadow hover:scale-105 transform-border"
                    onClick={() => handleUpdateStatus(order.id)}
                    disabled={
                      (statusUpdates[order.id] ?? order.status) === order.status
                    }
                  >
                    Оновити статус
                  </button>
                  {(order.status === "pending" || order.status === "confirmed" || order.status === "paid") && (
                    <button
                      className="btn-outline ml-2 px-3 py-1 text-sm"
                      onClick={() => handleCheckLiqPayStatus(order.id)}
                      disabled={loadingStatus[order.id]}
                    >
                      {loadingStatus[order.id] ? "Перевірка..." : "Оновити статус LiqPay"}
                    </button>
                  )}
                </div>
  
                <div className="flex flex-col gap-2 mt-4 mb-4 rounded-xl bg-white/80 p-4 shadow w-full max-w-4xl mx-auto">
                  <div className="flex items-center gap-2 bg-[#f7fafc] rounded px-3 py-2">
                    <span className="font-semibold text-accent">Телефон:</span>
                    <span className="break-all text-dark">{order.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#f3f0ff] rounded px-3 py-2">
                    <span className="font-semibold text-accent">Адреса:</span>
                    <span className="break-all text-dark">{order.address || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#e6fcf5] rounded px-3 py-2">
                    <span className="font-semibold text-accent">Створено:</span>
                    <span className="text-dark">{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="font-semibold text-accent">Товари:</span>
              <ul className="ml-0 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="bg-white text-dark p-3 rounded-lg border border-accent/40 shadow-sm flex flex-col gap-2"
                  >
                    <div className="font-semibold text-accent text-base">
                      {item.product_name || "Товар"}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      Категорія: {item.category_name || "-"}
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <div>
                        <span className="font-semibold">ID:</span> {item.product_id}
                      </div>
                      <div>
                        <span className="font-semibold">Кількість:</span> {item.quantity}
                      </div>
                      <div>
                        <span className="font-semibold">Ціна:</span> {item.price}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
         
            <div className="flex justify-end mt-4">
              <div className="bg-white/90 text-dark rounded-lg p-4 min-w-[220px] flex flex-col items-end">
                <span className="font-semibold text-accent text-lg">Сума замовлення:</span>
                <span className="font-bold text-2xl text-accent">{order.total_price} ₴</span>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button
                className="btn-outline text-red-500 border-red-400 hover:bg-red-500 hover:text-white transition-colors"
                onClick={() => handleDeleteOrder(order.id)}
                disabled={deleting[order.id]}
              >
                {deleting[order.id] ? "Видалення..." : "Видалити"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardOrders;
