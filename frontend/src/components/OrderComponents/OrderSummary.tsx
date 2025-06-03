import { useCart } from "../../context/CartContext";

const DELIVERY_COST = 0;
const PAYMENT_FEE = 30;

const OrderSummary = () => {
  const { cart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWithFee = total + DELIVERY_COST + PAYMENT_FEE;

  return (
    <div className="w-full md:w-[350px] bg-white rounded shadow p-6 mt-6 md:mt-0">
      <h3 className="text-lg font-bold mb-4 text-dark">Ваше замовлення</h3>
      <ul className="mb-4">
        {cart.map((item) => (
          <li
            key={item.product_id}
            className="flex justify-between items-center py-1 border-b last:border-b-0"
          >
            <span className="text-dark">
              {item.name}{" "}
              <span className="text-xs text-gray-500">x{item.quantity}</span>
            </span>
            <span className="font-bold text-black">{item.price * item.quantity}₴</span>
          </li>
        ))}
      </ul>
      <div className="mb-2 flex justify-between text-dark">
        <span>Разом</span>
        <span className="font-bold text-black">
          {cart.length} товар{cart.length === 1 ? "" : "и"} на суму
          <span className="ml-1">{total}₴</span>
        </span>
      </div>
      <div className="mb-2 flex justify-between">
        <span className="text-dark">Вартість доставки</span>
        <span className="font-bold text-black">
          {DELIVERY_COST === 0 ? "Безкоштовно" : `${DELIVERY_COST}₴`}
        </span>
      </div>
      <div className="mb-2 flex justify-between">
        <span className="text-dark">Комісія за грошовий переказ</span>
        <span className="font-bold text-black">{PAYMENT_FEE}₴</span>
      </div>
      <div className="mb-2 flex justify-between text-dark font-bold border-t pt-2">
        <span>До сплати</span>
        <span className="font-bold text-black">{totalWithFee}₴</span>
      </div>
      {/* <div className="mb-2 flex items-center gap-2">
        <input type="checkbox" id="no-paper" className="accent-accent" />
        <label
          htmlFor="no-paper"
          className="text-sm text-dark"
        >
          Не друкувати паперові чеки та гарантійні талони
        </label>
      </div> */}
      <div className="mb-2 text-xs text-dark">
        Підтверджуючи замовлення, я приймаю умови:{" "}
        <a
          href="/privacy"
          className="text-accent underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          положення про обробку і захист персональних даних
        </a>
        ,{" "}
        <a
          href="/terms"
          className="text-accent underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          угоди користувача
        </a>
      </div>
    </div>
  );
};

export default OrderSummary;
