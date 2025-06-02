import { useParams } from "react-router-dom";
import CompanyBankDetails from "../components/CompanyBankDetails";

const BankDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  return (
    <div className="flex-col my-10 items-center justify-center min-h-screen bg-main">
      {" "}
      <span className="block mb-6 text-2xl font-bold text-primary">
        Реквізити для оплати. Ви також знайдете їх у своєму кабінеті.
      </span>
      <CompanyBankDetails
        purpose={`Оплата за товари, замовлення №${orderId}`}
      />
      <div className="text-center mt-4 text-dark font-semibold"></div>
    </div>
  );
};

export default BankDetailsPage;
