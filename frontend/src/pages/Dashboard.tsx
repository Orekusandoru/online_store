import { Link, Outlet } from "react-router-dom";

const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Панель адміністратора</h1>

    <nav className="mb-6 flex gap-4">
      <Link to="categories" className="text-blue-600 underline">
        Категорії
      </Link>
      <Link to="products" className="text-blue-600 underline">
        Товари
      </Link>
    </nav>

    <Outlet />
  </div>
);

export default Dashboard;
