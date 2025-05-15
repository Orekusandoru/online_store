import { Link, Outlet } from "react-router-dom";

const Dashboard = () => (
  <div className="p-6 bg-main min-h-screen">
    <h1 className="text-2xl font-bold mb-4 text-dark">Панель адміністратора</h1>

    <nav className="mb-6 flex gap-4">
      <Link to="categories" className="btn-outline">
        Категорії
      </Link>
      <Link to="products" className="btn-outline">
        Товари
      </Link>
      <Link to="orders" className="btn-outline">
        Замовлення
      </Link>
    </nav>

    <Outlet />
  </div>
);

export default Dashboard;
