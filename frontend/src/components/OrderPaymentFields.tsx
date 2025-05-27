type Props = {
  paymentType: string;
  setPaymentType: (v: string) => void;
};

const OrderPaymentFields = ({ paymentType, setPaymentType }: Props) => (
  <div className="mb-4">
    <label className="block text-dark font-semibold mb-2">Тип оплати</label>
    <div className="flex flex-col gap-2 text-dark">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="paymentType"
          value="liqpay"
          checked={paymentType === "liqpay"}
          onChange={() => setPaymentType("liqpay")}
        />
        Приват24 / Visa / MasterCard (онлайн)
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="paymentType"
          value="bank"
          checked={paymentType === "bank"}
          onChange={() => setPaymentType("bank")}
        />
        Безготівкова для фізичних осіб
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="paymentType"
          value="cod"
          checked={paymentType === "cod"}
          onChange={() => setPaymentType("cod")}
        />
        Оплата під час отримання товару
      </label>
    </div>
    <div className="text-xs text-dark mt-1">
      {paymentType === "liqpay" && "Після підтвердження замовлення ви будете перенаправлені на сторінку LiqPay для оплати."}
      {paymentType === "bank" && "Ви отримаєте рахунок для оплати після підтвердження замовлення."}
      {paymentType === "cod" && "Оплата здійснюється при отриманні товару."}
    </div>
  </div>
);

export default OrderPaymentFields;
