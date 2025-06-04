import { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card shadow-md rounded-lg mt-16 sm:mt-24 md:mt-32 flex flex-col justify-center">
      <h2 className="text-xl font-bold mb-4 text-dark">Скидання пароля</h2>
      {sent ? (
        <div className="text-green-600">Інструкції надіслано на email, якщо він зареєстрований.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            className="input-main w-full mb-3"
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button className="btn-main w-full">Відправити</button>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
