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
  const [compareOpen, setCompareOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [compareCount, setCompareCount] = useState(0);

  useEffect(() => {
    const updateCompareCount = () => {
      const list = localStorage.getItem("compareList");
      setCompareCount(list ? JSON.parse(list).length : 0);
    };
    updateCompareCount();
    window.addEventListener("storage", updateCompareCount);
    return () => window.removeEventListener("storage", updateCompareCount);
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (compareRef.current && !compareRef.current.contains(event.target as Node)) {
        setCompareOpen(false);
      }
    };
    if (compareOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [compareOpen]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <header className="w-full fixed top-0 left-0 z-50 px-0 py-4 bg-header text-accent mb-8 shadow">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-8 mx-2 sm:mx-4 md:mx-8">
        <Link
          to="/"
          className="text-2xl font-bold mb-2 sm:mb-0 transition-colors duration-200 cursor-pointer select-none"
          style={{ textDecoration: "none", color: "inherit" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#F4CE14")}
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
            onClick={() => {
              setCompareOpen(false);
              window.location.href = "/compare";
            }}
            aria-label="Порівняння"
            type="button"
          >
            <span role="img" aria-label="Порівняння" className="text-xl">⚖️</span>
            {compareCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full px-2 py-0.5 shadow">
                {compareCount}
              </span>
            )}
          </button>
          {/* Кнопка кошика */}
          <button
            className="relative btn-outline"
            onClick={() => setCartOpen((v) => !v)}
            aria-label="Кошик"
            type="button"
          >
            <span role="img" aria-label="Кошик" className="text-xl">🛒</span>
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
