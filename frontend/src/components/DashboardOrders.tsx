import { useEffect, useState } from "react";
import axios from "axios";

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name?: string;
  category_name?: string;
  image_url?: string; 
};

type Order = {
  payment_type: string;
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
  const [editOrderId, setEditOrderId] = useState<number | null>(null);
  const [editOrderData, setEditOrderData] = useState<any>(null);
  const [editError, setEditError] = useState<string>("");

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

  const handleEditOrder = (order: Order) => {
    setEditOrderId(order.id);
    setEditOrderData({
      name: order.name || "",
      email: order.email || "",
      phone: order.phone || "",
      address: order.address || "",
      items: order.items.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        price: i.price,
        product_name: i.product_name,
        image_url: i.image_url,
        category_name: i.category_name,
      })),
    });
    setEditError("");
  };

  const handleEditOrderChange = (field: string, value: any) => {
    setEditOrderData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditOrderItemChange = (idx: number, field: string, value: any) => {
    setEditOrderData((prev: any) => ({
      ...prev,
      items: prev.items.map((item: any, i: number) =>
        i === idx ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddOrderItem = () => {
    setEditOrderData((prev: any) => ({
      ...prev,
      items: [
        ...prev.items,
        { product_id: "", quantity: 1, price: 0, product_name: "", image_url: "", category_name: "" },
      ],
    }));
  };

  const handleRemoveOrderItem = (idx: number) => {
    setEditOrderData((prev: any) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== idx),
    }));
  };

  const handleSaveOrderEdit = async () => {
    if (!editOrderId) return;
    const token = sessionStorage.getItem("token");
    if (!token) return;
    try {
      await axios.put(
        `/api/orders/${editOrderId}`,
        {
          name: editOrderData.name,
          email: editOrderData.email,
          phone: editOrderData.phone,
          address: editOrderData.address,
          items: editOrderData.items.map((item: any) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditOrderId(null);
      setEditOrderData(null);
      setEditError("");
      fetchOrders();
    } catch {
      setEditError("Не вдалося зберегти зміни");
    }
  };


  return (
    <div className="max-w-fit mx-auto py-8 ">
      <h1 className="text-3xl font-bold mb-8 text-center text- drop-shadow">Всі замовлення</h1>
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
                  <span className="text-gray-00">|</span>
                  <span className="font-semibold">Статус:</span>
                  <select
                    value={statusUpdates[order.id] ?? order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="select-main mx-2 btn-mainborder-accent focus:ring-accent"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status} className="btn-main">
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
                {/* --- CRUD: Edit form --- */}
                <div className="flex flex-col gap-2 mt-4 mb-4 rounded-xl bg-white/80 p-4 shadow w-full max-w-4xl mx-auto">
                  {editOrderId === order.id ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-dark font-semibold">Ім'я:</label>
                        <input
                          className="input-main"
                          value={editOrderData.name}
                          onChange={e => handleEditOrderChange("name", e.target.value)}
                        />
                        <label className="text-dark font-semibold">Email:</label>
                        <input
                          className="input-main"
                          value={editOrderData.email}
                          onChange={e => handleEditOrderChange("email", e.target.value)}
                        />
                        <label className="text-dark font-semibold">Телефон:</label>
                        <input
                          className="input-main"
                          value={editOrderData.phone}
                          onChange={e => handleEditOrderChange("phone", e.target.value)}
                        />
                        <label className="text-dark font-semibold">Адреса:</label>
                        <input
                          className="input-main"
                          value={editOrderData.address}
                          onChange={e => handleEditOrderChange("address", e.target.value)}
                        />
                      </div>
                      <div className="mt-4">
                        <span className="font-semibold text-accent">Товари:</span>
                        <ul className="mt-2 space-y-2">
                          {editOrderData.items.map((item: any, idx: number) => (
                            <li key={idx} className="flex flex-col sm:flex-row gap-2 items-start bg-[#f7fafc] rounded p-2">
                              <input
                                className="input-main w-24"
                                type="number"
                                placeholder="ID"
                                value={item.product_id}
                                onChange={e => handleEditOrderItemChange(idx, "product_id", e.target.value)}
                              />
                              <input
                                className="input-main w-24"
                                type="number"
                                placeholder="Кількість"
                                value={item.quantity}
                                onChange={e => handleEditOrderItemChange(idx, "quantity", e.target.value)}
                              />
                              <input
                                className="input-main w-24"
                                type="number"
                                placeholder="Ціна"
                                value={item.price}
                                onChange={e => handleEditOrderItemChange(idx, "price", e.target.value)}
                              />
                              <button
                                className="btn-outline text-red-500 border-red-400"
                                onClick={() => handleRemoveOrderItem(idx)}
                              >
                                Видалити
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button className="btn-outline mt-2" onClick={handleAddOrderItem}>
                          Додати товар
                        </button>
                      </div>
                      {editError && <div className="text-red-500 mt-2">{editError}</div>}
                      <div className="flex gap-2 mt-4">
                        <button className="btn-main" onClick={handleSaveOrderEdit}>
                          Зберегти зміни
                        </button>
                        <button className="btn-outline" onClick={() => setEditOrderId(null)}>
                          Скасувати
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 bg-[#e0e7e9] rounded px-3 py-2">
                        <span className="font-semibold text-accent">Ім'я:</span>
                        <span className="break-all text-[#222]">{order.name || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#e0e7e9] rounded px-3 py-2">
                        <span className="font-semibold text-accent">Email:</span>
                        <span className="break-all text-[#222]">{order.email || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#e0e7e9] rounded px-3 py-2">
                        <span className="font-semibold text-accent">Телефон:</span>
                        <span className="break-all text-[#222]">{order.phone || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#e3e6f3] rounded px-3 py-2">
                        <span className="font-semibold text-accent">Адреса:</span>
                        <span className="break-all text-[#222]">{order.address || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#d6f5e6] rounded px-3 py-2">
                        <span className="font-semibold text-accent">Створено:</span>
                        <span className="text-[#222]">{new Date(order.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#f9f5db] rounded px-3 py-2">
                        <span className="font-semibold text-accent">Оплата:</span>
                        <span className="break-all text-[#222]">{order.payment_type || "-"}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div>
              <span className="font-semibold text-accent">Товари:</span>
              <ul className="ml-0 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="bg-white p-3 rounded-lg border border-accent/40 shadow-sm flex flex-col sm:flex-row gap-4 items-start text-[#222]"
                  >
                    {item.image_url && (
                      <div className="flex-shrink-0 w-28 h-28 flex items-center justify-center bg-white rounded border border-gray-200 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.product_name || "Товар"}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="font-semibold text-accent text-base mb-1">
                        {item.product_name || "Товар"}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <div className="bg-[#e0e7e9] rounded px-2 py-1">
                          <span className="font-semibold">ID:</span> {item.product_id}
                        </div>
                        <div className="bg-[#e3e6f3] rounded px-2 py-1">
                          <span className="font-semibold">Кількість:</span> {item.quantity}
                        </div>
                        <div className="bg-[#d6f5e6] rounded px-2 py-1">
                          <span className="font-semibold">Ціна:</span> {item.price}
                        </div>
                        <div className="bg-[#f9f5db] rounded px-2 py-1">
                          <span className="font-semibold">Категорія:</span> {item.category_name || "-"}
                        </div>
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
            <div className="flex justify-end mt-2 gap-2">
              <button
                className="btn-outline"
                onClick={() => handleEditOrder(order)}
                disabled={editOrderId === order.id}
              >
                Редагувати
              </button>
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
