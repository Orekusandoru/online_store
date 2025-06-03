import OrderForm from "../components/OrderComponents/OrderForm";
import OrderSummary from "../components/OrderComponents/OrderSummary";

const OrderPage = () => (
  <div className="flex flex-col md:flex-row items-start justify-center bg-main min-h-screen gap-8 p-4">
    <div className="flex-1 max-w-xl">
      <OrderForm />
    </div>
    <OrderSummary />
  </div>
);

export default OrderPage;
