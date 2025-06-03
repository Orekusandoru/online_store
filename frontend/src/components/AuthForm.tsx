import { useState } from "react";
import { login, register } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

type AuthFormProps = {
  type: "login" | "register";
};

type AuthResponse = {
  token: string;
  role: "user" | "admin" | "seller";
};

const isAuthResponse = (data: any): data is AuthResponse => {
  return data && typeof data.token === "string" && typeof data.role === "string";
};

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "seller">("user");  
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data =
        type === "login"
          ? await login(email, password)
          : await register(email, password, role); 

      if (isAuthResponse(data)) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.role);

        if (data.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card shadow-md rounded-lg mt-16 sm:mt-24 md:mt-32 flex flex-col justify-center">
      <h2 className="text-xl font-bold mb-4 text-dark">{type === "login" ? "Вхід" : "Реєстрація"}</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          className="input-main w-full mb-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-main w-full mb-3"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* {type === "register" && (
          <select
            className="select-main w-full mb-3"
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "seller")}
          >
            <option value="user">Користувач</option>
            <option value="seller">Продавець</option>
          </select>
        )} */}
        {type === "login" && (
          <div className="mb-3 text-right">
            <Link to="/forgot-password" className="text-cyan-700 hover:underline text-sm">
              Забули пароль?
            </Link>
          </div>
        )}
        <button className="btn-main w-full">
          {type === "login" ? "Увійти" : "Зареєструватися"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
