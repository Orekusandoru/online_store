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
import OrderForm from "./components/OrderForm";
import DashboardOrders from "./components/DashboardOrders";
import Header from "./components/Header"; // додати
import OrderPage from "./pages/OrderPage";
import ProfilePage from "./pages/ProfilePage";
import CompanyBankDetails from "./components/CompanyBankDetails";
import { useParams } from "react-router-dom";
import BankDetailsPage from "./pages/BankDetailsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProductPage from "./pages/ProductPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ComparePage from "./pages/ComparePage";


const App = () => (
  <Router>
    <CartProvider>
      <Header />
      <div className="pt-22 bg-main min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/order" element={<OrderPage />} /> {/* новий маршрут */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/bank-details/:orderId" element={<BankDetailsPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/compare" element={<ComparePage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="categories" element={<DashboardCategories />} />
              <Route path="products" element={<DashboardProducts />} />
              <Route path="orders" element={<DashboardOrders />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </CartProvider>
  </Router>
);

export default App;
