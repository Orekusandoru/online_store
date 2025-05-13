import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import DashboardCategories from "./components/DashboardCategories";
import DashboardProducts from "./components/DashboardProducts";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import { CartProvider } from "./context/CartContext";

const App = () => (
  <Router>
  <CartProvider>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} /> {/* <-- для всіх */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="categories" element={<DashboardCategories />} />
          <Route path="products" element={<DashboardProducts />} />
        </Route>
      </Route>
    </Routes>
  </CartProvider>
</Router>

);

export default App;
