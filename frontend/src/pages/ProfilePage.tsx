import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import type { Product } from "../../types/types";

type User = {
  name?: string;
  email: string;
  phone?: string;
  address?: string;
};

type OrderItem = {
  product_id: number;
  quantity: number;
  price: number;
  product_name?: string;
  image_url?: string;
};

type Order = {
  payment_type: string;
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
};

type Props = {
  purpose?: string;
};

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"profile" | "orders" | "reset">("profile");
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>(
    {}
  );
  const [showResetForm, setShowResetForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
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

        setOrders(
          (ordersRes.data || []).filter(
            (order) => order.items && order.items.length > 0
          )
        );
      } catch (err) {}
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess(false);
    const token = sessionStorage.getItem("token");
    try {
      await axios.post(
        "/api/auth/reset-password",
        { oldPassword, password: resetPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResetSuccess(true);
      setOldPassword("");
      setResetPassword("");
    } catch (e: any) {
      setResetError(e.response?.data?.message || "Не вдалося змінити пароль");
    }
  };


  function translateOrderStatus(status: string): string {
    switch (status) {
      case "pending":
        return "Очікує відправки";
      case "paid":
        return "Оплачено";
      case "shipped":
        return "Відправлено";
      case "delivered":
        return "Доставлено";
      case "cancelled":
        return "Скасовано";
      case "processing":
        return "В обробці";
      default:
        return status;
    }
  }

  if (!user) return <div className="p-6">Завантаження профілю...</div>;

  return (
    <div className="text-xl  text-gray-800 max-w-4xl mx-auto p-6 bg-card-secondary  rounded-xl shadow flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-56 flex-shrink-0 mb-4 md:mb-0">
        <nav className="flex md:flex-col gap-2">
          <button
            className={`btn-outline w-full ${
              tab === "profile" ? "bg-accent text-white" : ""
            }`}
            onClick={() => setTab("profile")}
          >
            Профіль
          </button>
          <button
            className={`btn-outline w-full ${
              tab === "orders" ? "bg-accent text-white" : ""
            }`}
            onClick={() => setTab("orders")}
          >
            Мої замовлення
          </button>
          <button
            className={`btn-outline w-full ${
              tab === "reset" ? "bg-accent text-white" : ""
            }`}
            onClick={() => setTab("reset")}
          >
            Змінити пароль
          </button>
        </nav>
      </aside>

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
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                  <input
                    className="input-main w-full mb-2"
                    placeholder="Телефон"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                  <input
                    className="input-main w-full mb-2"
                    placeholder="Адреса"
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                  />
                  <button className="btn-main mr-2" onClick={handleSave}>
                    Зберегти
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => setEdit(false)}
                  >
                    Скасувати
                  </button>
                  {error && <div className="text-red-500 mt-2">{error}</div>}
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center bg-main/80 rounded p-2 shadow-sm">
                    <span className="w-28 text-dark font-semibold">Ім'я:</span>
                    <span className="text-gray-900 text-base">
                      {user.name || "-"}
                    </span>
                  </div>
                  <div className="flex items-center bg-main/80 rounded p-2 shadow-sm">
                    <span className="w-28 text-dark font-semibold">
                      Телефон:
                    </span>
                    <span className="text-gray-900 text-base">
                      {user.phone || "-"}
                    </span>
                  </div>
                  <div className="flex items-center bg-main/80 rounded p-2 shadow-sm sm:col-span-2">
                    <span className="w-28 text-dark font-semibold">
                      Адреса:
                    </span>
                    <span className="text-gray-900 text-base">
                      {user.address || "-"}
                    </span>
                  </div>
                  <div className="sm:col-span-2 flex gap-2 flex-wrap">
                    <button
                      className="btn-main mt-2"
                      onClick={() => setEdit(true)}
                    >
                      Редагувати
                    </button>
                  </div>
                  {showResetForm && (
                    <div className="sm:col-span-2 mt-4">
                      <form
                        onSubmit={handleResetPassword}
                        className="flex flex-col gap-2 bg-main/40 rounded p-4"
                      >
                        <label className="font-semibold text-dark">
                          Старий пароль
                        </label>
                        <input
                          className="input-main"
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required
                        />
                        <label className="font-semibold text-dark">
                          Новий пароль
                        </label>
                        <input
                          className="input-main"
                          type="password"
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          required
                        />
                        <div className="flex gap-2">
                          <button className="btn-main" type="submit">
                            Зберегти новий пароль
                          </button>
                          <button
                            className="btn-outline"
                            type="button"
                            onClick={() => {
                              setShowResetForm(false);
                              setOldPassword("");
                              setResetPassword("");
                              setResetError("");
                            }}
                          >
                            Скасувати
                          </button>
                        </div>
                        {resetError && (
                          <div className="text-red-500">{resetError}</div>
                        )}
                        {resetSuccess && (
                          <div className="text-green-600">Пароль змінено!</div>
                        )}
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        {tab === "orders" && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-accent text-center drop-shadow">
              Мої замовлення
            </h2>
            <ul className="space-y-6">
              {orders.length === 0 && <li>Замовлень немає</li>}
              {orders.map((order) => {
                const expanded = expandedOrders[order.id] || false;
                return (
                  <li
                    key={order.id}
                    className="bg-dark text-white rounded-xl shadow-lg border border-accent/30 hover:shadow-2xl transition-shadow duration-200 p-6 flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="font-bold text-accent text-xl">
                          №{order.id}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="font-semibold">Статус:</span>
                        <span className="text-accent font-bold">
                          {translateOrderStatus(order.status)}
                        </span>

                        {order.payment_type === "bank" &&
                          order.status !== "paid" && (
                            <Link
                              to={`/bank-details/${order.id}`}
                              className="btn-outline ml-4"
                            >
                              Реквізити для оплати
                            </Link>
                          )}
                      </div>
                      <div className="text-sm text-gray-300">
                        Створено: {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-2 mb-2">
                      <div className="inline-block bg-accent rounded-lg px-4 py-2">
                        <span className="font-semibold text-bg mr-2">
                          Сума:
                        </span>
                        <span className="font-bold text-bg text-lg align-middle">
                          {order.total_price}
                        </span>
                        <span
                          className="ml-1 text-base text-bg"
                          style={{ fontSize: "0.95em" }}
                        >
                          грн
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-accent">
                          Товари:
                        </span>
                        {order.items.length > 1 && (
                          <button
                            className="btn-outline"
                            style={{ minWidth: 90 }}
                            onClick={() =>
                              setExpandedOrders((prev) => ({
                                ...prev,
                                [order.id]: !expanded,
                              }))
                            }
                          >
                            {expanded
                              ? "Сховати"
                              : `Показати всі (${order.items.length})`}
                          </button>
                        )}
                      </div>
                      <ul className="ml-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(expanded || order.items.length === 1
                          ? order.items
                          : [order.items[0]]
                        ).map((item, idx) => (
                          <li
                            key={idx}
                            className="bg-white p-3 rounded-lg border border-accent/40 shadow-sm flex flex-row gap-3 items-center"
                          >
                            <OrderProductPreview
                              productId={item.product_id}
                              fallbackItem={item}
                            />
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                              <div className="font-semibold text-dark text-base truncate">
                                <Link
                                  to={`/product/${item.product_id}`}
                                  className="hover:underline"
                                >
                                  <OrderProductName
                                    productId={item.product_id}
                                    fallbackName={item.product_name}
                                  />
                                </Link>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-dark">
                                <div>
                                  <span className="font-semibold">
                                    Кількість:
                                  </span>{" "}
                                  {item.quantity}
                                </div>
                                <div>
                                  <span className="font-semibold">Ціна:</span>{" "}
                                  {item.price} грн
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                        {!expanded && order.items.length > 1 && (
                          <li className="text-xs text-gray-400 flex items-center">
                            ...та ще {order.items.length - 1} товар
                            {order.items.length - 1 > 1 ? "и" : ""}
                          </li>
                        )}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {tab === "reset" && (
          <div className="max-w-lg mx-auto bg-white/90 rounded-lg p-6 shadow">
            <h2 className="text-2xl font-bold mb-4 text-dark">Зміна пароля</h2>
            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-2"
            >
              <label className="font-semibold text-dark">Старий пароль</label>
              <input
                className="input-main"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <label className="font-semibold text-dark">Новий пароль</label>
              <input
                className="input-main"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                required
              />
              <div className="flex gap-2 mt-2">
                <button className="btn-main" type="submit">
                  Зберегти новий пароль
                </button>
                <button
                  className="btn-outline"
                  type="button"
                  onClick={() => {
                    setTab("profile");
                    setOldPassword("");
                    setResetPassword("");
                    setResetError("");
                    setResetSuccess(false);
                  }}
                >
                  Скасувати
                </button>
              </div>
              {resetError && <div className="text-red-500">{resetError}</div>}
              {resetSuccess && (
                <div className="text-green-600">Пароль змінено!</div>
              )}
            </form>
          </div>
        )}
      </section>
    </div>
  );
};

function OrderProductPreview({
  productId,
  fallbackItem,
}: {
  productId: number;
  fallbackItem: any;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`/api/products/${productId}`)
      .then((res) => {
        const product = res.data as Product;
        if (mounted) {
          setImageUrl(product.image_url || null);
          setProductName(product.name || null);
        }
      })
      .catch(() => {
        if (mounted) {
          setImageUrl(
            fallbackItem.image_url && fallbackItem.image_url !== "null"
              ? fallbackItem.image_url
              : null
          );
          setProductName(
            fallbackItem.product_name && fallbackItem.product_name !== "null"
              ? fallbackItem.product_name
              : null
          );
        }
      });
    return () => {
      mounted = false;
    };
  }, [productId, fallbackItem.image_url, fallbackItem.product_name]);

  return (
    <Link
      to={`/product/${productId}`}
      className="flex-shrink-0 flex flex-col items-center group "
      style={{ minWidth: 80 }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={productName || `Товар #${productId}`}
          className="w-20 h-20 object-contain bg-white rounded shadow group-hover:scale-105 transition-transform"
        />
      ) : (
        <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded text-gray-400">
          <span className="text-2xl">🛒</span>
        </div>
      )}
      <span className="text-xs text-dark mt-1 underline group-hover:text-dark font-semibold text-center">
        Перейти
      </span>
      <span className="text-xs text-dark font-semibold text-center mt-1 truncate w-20">
        {productName || "-"}
      </span>
    </Link>
  );
}

function OrderProductName({
  productId,
  fallbackName,
}: {
  productId: number;
  fallbackName?: string;
}) {
  const [productName, setProductName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`/api/products/${productId}`)
      .then((res) => {
        const product = res.data as Product;
        if (mounted) setProductName(product.name || null);
      })
      .catch(() => {
        if (mounted)
          setProductName(
            fallbackName && fallbackName !== "null" ? fallbackName : null
          );
      });
    return () => {
      mounted = false;
    };
  }, [productId, fallbackName]);

  return <>{productName || "-"}</>;
}

export default ProfilePage;
