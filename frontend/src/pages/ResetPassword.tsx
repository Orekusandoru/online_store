import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/api/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-main shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-dark">Новий пароль</h2>
      {done ? (
        <div className="text-green-600">Пароль змінено! Перенаправлення на вхід...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            className="input-main w-full mb-3"
            type="password"
            placeholder="Новий пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="btn-main w-full">Змінити пароль</button>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
