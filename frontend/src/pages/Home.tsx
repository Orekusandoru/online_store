import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-main">
      <main className="max-w-2xl mx-auto p-6 bg-white/80 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-dark mb-4">Ласкаво просимо!</h2>
        <p className="text-dark mb-2">
          Це головна сторінка магазину. Ви можете перейти до магазину, увійти або зареєструватися, а якщо ви адміністратор — перейти до панелі керування.
        </p>
        <div className="flex flex-wrap gap-4 mt-6">
          <Link to="/shop" className="btn-main">Перейти до магазину</Link>
          {!token && <Link to="/login" className="btn-outline">Вхід</Link>}
          {!token && <Link to="/register" className="btn-outline">Реєстрація</Link>}
          {token && role === "admin" && (
            <Link to="/dashboard" className="btn-outline">Адмін-панель</Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
