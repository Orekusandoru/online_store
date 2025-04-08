import { useState } from "react";
import { login, register } from "../api/auth";
import { useNavigate } from "react-router-dom";

type AuthFormProps = {
  type: "login" | "register";
};

type AuthResponse = {
  token: string;
};

const isAuthResponse = (data: any): data is AuthResponse => {
  return data && typeof data.token === "string";
};

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data =
        type === "login" ? await login(email, password) : await register(email, password);
      
      // Перевірка типу даних
      if (isAuthResponse(data)) {
        sessionStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        throw new Error("Невірна структура відповіді");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-green-800 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">{type === "login" ? "Вхід" : "Реєстрація"}</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          className="border p-2 w-full mb-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full mb-3"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="bg-blue-500 text-white p-2 w-full">
          {type === "login" ? "Увійти" : "Зареєструватися"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
