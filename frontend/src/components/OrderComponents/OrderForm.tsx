import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OrderDeliveryFields from "./OrderDeliveryFields";
import OrderPaymentFields from "./OrderPaymentFields";



const OrderForm = () => {
  const { cart, clearCart } = useCart();
  const token = sessionStorage.getItem("token");
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 
  const [isPostomat, setIsPostomat] = useState(false);
  const [city, setCity] = useState("");
  const [cityRef, setCityRef] = useState("");
  const [warehouse, setWarehouse] = useState("");

  const [paymentType, setPaymentType] = useState("cod"); 
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [bankOrderId, setBankOrderId] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios
        .get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const data = res.data as { user?: { id?: string; email?: string; phone?: string; address?: string; name?: string } };
          const user = data.user || {};
          setUserData((prev) => ({
            ...prev,
            id: user.id || "",
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

      const deliveryAddress = `${city}, ${isPostomat ? "Поштомат" : "Відділення"}: ${warehouse}`;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        orderPayload = { ...orderPayload, ...userData, user_id: userData.id, address: deliveryAddress, paymentType };
      } else {
        orderPayload = { ...orderPayload, ...userData, address: deliveryAddress, paymentType };
      }
      const response = await axios.post("/api/orders", orderPayload, { headers });
      const data = response.data as { orderId?: number; total?: number };

      // LiqPay 
      if (paymentType === "liqpay") {
        
        const liqpayRes = await axios.post<{ liqpayData: string; signature: string }>("/api/liqpay-initiate", {
          orderId: data.orderId,
          amount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
          description: `Оплата замовлення №${data.orderId || "?"}`,
        });
        const { liqpayData, signature } = liqpayRes.data;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://www.liqpay.ua/api/3/checkout";
        form.acceptCharset = "utf-8";
        form.target = "_blank";
        form.innerHTML = `
          <input type="hidden" name="data" value="${liqpayData}" />
          <input type="hidden" name="signature" value="${signature}" />
        `;
        document.body.appendChild(form);
        form.submit();
        form.remove();

        clearCart();
        setUserData({ id: "", name: "", email: "", phone: "", address: "" });
        setCity("");
        setCityRef("");
        setWarehouse("");
        navigate("/shop");
        return;
      }

      if (paymentType === "bank") {
        clearCart();
        setUserData({ id: "", name: "", email: "", phone: "", address: "" });
        setCity("");
        setCityRef("");
        setWarehouse("");
        setBankOrderId(data.orderId ?? null);
        setLoading(false);
        navigate(`/bank-details/${data.orderId}`);
        return;
      }

      alert(`Замовлення №${data.orderId || "?"} створено!`);
      clearCart();
      setUserData({ id: "", name: "", email: "", phone: "", address: "" });
      setCity("");
      setCityRef("");
      setWarehouse("");
      navigate("/shop");
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
    <form id="order" onSubmit={handleOrder} className="max-w-lg mx-auto p-6 bg-card m-2 rounded shadow">
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
      <OrderDeliveryFields
        isPostomat={isPostomat}
        setIsPostomat={setIsPostomat}
        city={city}
        setCity={setCity}
        cityRef={cityRef}
        setCityRef={setCityRef}
        warehouse={warehouse}
        setWarehouse={setWarehouse}
      />
      <OrderPaymentFields
        paymentType={paymentType}
        setPaymentType={setPaymentType}
      />
      {paymentType === "bank" && (
        <div className="my-4">
          <div className="text-xs text-dark mt-2">
            <b>Збережіть ці реквізити для оплати. Вони також будуть доступні у вашому кабінеті.</b>
          </div>
        </div>
      )}
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
