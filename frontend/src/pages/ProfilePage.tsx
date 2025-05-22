import { useEffect, useState } from "react";
import axios from "axios";

type User = {
  name?: string;
  email: string;
  phone?: string;
  address?: string;
};

type Order = {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  items: { product_id: number; quantity: number; price: number }[];
};

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"profile" | "orders">("profile");

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
        // Тепер бекенд повертає всі дані користувача з БД
        const profileRes = await axios.get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = profileRes.data as { user: User };
        setUser(data.user);
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
        });

        const ordersRes = await axios.get<Order[]>("/api/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(ordersRes.data);
      } catch (err) {
        // optionally handle error
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setError("");
    const token = sessionStorage.getItem("token");
    try {
      await axios.patch(
        "/api/profile",
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((u) => (u ? { ...u, ...form } : u));
      setEdit(false);
    } catch (e: any) {
      setError(e.response?.data?.message || "Не вдалося оновити дані");
    }
  };

  if (!user) return <div className="p-6">Завантаження профілю...</div>;

  return (
    <div className="text-xl  text-gray-800 max-w-4xl mx-auto p-6 bg-main rounded-xl shadow flex flex-col md:flex-row gap-8">
      {/* Vertical navigation */}
      <aside className="w-full md:w-56 flex-shrink-0 mb-4 md:mb-0">
        <nav className="flex md:flex-col gap-2">
          <button
            className={`btn-outline w-full ${tab === "profile" ? "bg-accent text-white" : ""}`}
            onClick={() => setTab("profile")}
          >
            Профіль
          </button>
          <button
            className={`btn-outline w-full ${tab === "orders" ? "bg-accent text-white" : ""}`}
            onClick={() => setTab("orders")}
          >
            Мої замовлення
          </button>
        </nav>
      </aside>
      {/* Main content */}
      <section className="flex-1">
        {tab === "profile" && (
          <>
            <h1 className="text-2xl font-bold mb-4 text-dark">Профіль</h1>
            <div className="mb-6 bg-white/90 rounded-lg p-6 shadow">
              <div className="flex items-center bg-main/80 rounded p-2 shadow-sm mb-2">
                <span className="w-28 text-dark font-semibold">Email:</span>
                <span className="text-gray-900 text-base">{user.email}</span>
              </div>
              {edit ? (
                <>
                  <input
                    className="input-main w-full mb-2"
                    placeholder="Ім'я"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <input
                    className="input-main w-full mb-2"
                    placeholder="Телефон"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                  <input
                    className="input-main w-full mb-2"
                    placeholder="Адреса"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                  <button className="btn-main mr-2" onClick={handleSave}>
                    Зберегти
                  </button>
                  <button className="btn-outline" onClick={() => setEdit(false)}>
                    Скасувати
                  </button>
                  {error && <div className="text-red-500 mt-2">{error}</div>}
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center bg-main/80 rounded p-2 shadow-sm">
                    <span className="w-28 text-dark font-semibold">Ім'я:</span>
                    <span className="text-gray-900 text-base">{user.name || "-"}</span>
                  </div>
                  <div className="flex items-center bg-main/80 rounded p-2 shadow-sm">
                    <span className="w-28 text-dark font-semibold">Телефон:</span>
                    <span className="text-gray-900 text-base">{user.phone || "-"}</span>
                  </div>
                  <div className="flex items-center bg-main/80 rounded p-2 shadow-sm sm:col-span-2">
                    <span className="w-28 text-dark font-semibold">Адреса:</span>
                    <span className="text-gray-900 text-base">{user.address || "-"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <button className="btn-main mt-2" onClick={() => setEdit(true)}>
                      Редагувати
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {tab === "orders" && (
          <>
            <h2 className="text-xl font-bold mb-2 text-dark">Мої замовлення</h2>
            <ul className="space-y-4">
              {orders.length === 0 && <li>Замовлень немає</li>}
              {orders.map((order) => (
                <li key={order.id} className="bg-dark text-white rounded p-4 shadow">
                  <div>
                    <b>№{order.id}</b> | <span className="text-accent">{order.status}</span> |{" "}
                    <span>Сума: {order.total_price} грн</span>
                  </div>
                  <div>
                    <b>Створено:</b> {new Date(order.created_at).toLocaleString()}
                  </div>
                  <div>
                    <b>Товари:</b>
                    <ul className="ml-4">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          ID товару: {item.product_id}, Кількість: {item.quantity}, Ціна: {item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
