import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Cart from "./Cart";
import { useCart } from "../context/CartContext";
import CompanyBankDetails from "./CompanyBankDetails";

const Header = () => {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const navigate = useNavigate();

  const [cartOpen, setCartOpen] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
    };
    if (cartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cartOpen]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <header className="w-full fixed top-0 left-0 z-50 px-0 py-4 bg-dark text-bg shadow mb-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-8">
        <Link
          to="/"
          className="text-2xl font-bold mb-2 sm:mb-0 transition-colors duration-200 cursor-pointer select-none"
          style={{ textDecoration: "none", color: "inherit" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#FE7743")}
          onMouseOut={(e) => (e.currentTarget.style.color = "")}
        >
          Online Store
        </Link>
        <nav className="flex gap-4 items-center">
          <Link to="/shop" className="btn-outline">
            Магазин
          </Link>
          <button
            className="relative btn-outline"
            onClick={() => setCartOpen((v) => !v)}
            aria-label="Кошик"
            type="button"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full px-2 py-0.5 shadow">
                {cartCount}
              </span>
            )}
          </button>
          {token && (
            <Link
              to="/profile"
              className="btn-outline flex items-center gap-1"
              aria-label="Кабінет"
              title="Особистий кабінет"
            >
              <span className="text-lg">👤</span>
              <span className="hidden sm:inline">Кабінет</span>
            </Link>
          )}
          {cartOpen && (
            <div
              ref={cartRef}
              className="absolute right-4 top-16 z-50 w-80 max-w-[90vw] bg-[#EDF1D6] rounded-xl shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Cart onClose={() => setCartOpen(false)} />
            </div>
          )}
          {!token && (
            <>
              <Link to="/login" className="btn-outline">
                Вхід
              </Link>
              <Link to="/register" className="btn-outline">
                Реєстрація
              </Link>
            </>
          )}
          {token && role === "admin" && (
            <Link to="/dashboard" className="btn-outline">
              Адмін-панель
            </Link>
          )}
          {token && (
            <button onClick={handleLogout} className="btn-main">
              Вийти
            </button>
          )}
          <button
            className="btn-outline"
            onClick={() => setShowContacts(true)}
            type="button"
          >
            Контакти
          </button>
        </nav>
        {showContacts && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
            onClick={() => setShowContacts(false)}
          >
            <div
              className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-accent"
                onClick={() => setShowContacts(false)}
              >
                &times;
              </button>
              <CompanyBankDetails />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
