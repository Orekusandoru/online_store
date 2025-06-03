import { useEffect, useState } from "react";
import axios from "axios";
import { Product } from "../../types/types";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

type Category = { id: number; name: string };

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { addToCart } = useCart();
  const [compareList, setCompareList] = useState<number[]>(() => {
    const stored = localStorage.getItem("compareList");
    return stored ? JSON.parse(stored) : [];
  });
  const navigate = useNavigate();

  const [filterForm, setFilterForm] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
  });

  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
    page: 1,
    limit: 9,
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios
      .get<Category[]>("/api/categories", {
        headers: sessionStorage.getItem("token")
          ? { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
          : undefined,
      })
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const params: any = {
      ...filters,
      page: filters.page,
      limit: filters.limit,
    };
    Object.keys(params).forEach((k) => {
      if (params[k] === "" || params[k] === null) delete params[k];
    });

    axios
      .get<Product[]>("/api/products", { params })
      .then((res) => {
        setProducts(res.data);
        setTotalPages(res.data.length < filters.limit ? filters.page : filters.page + 1);
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
      });
  }, [filters]);

  const handleFilterFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilterForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleApplyFilters = () => {
    setFilters((f) => ({
      ...f,
      ...filterForm,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilterForm({ category: "", minPrice: "", maxPrice: "", sort: "" });
    setFilters((f) => ({
      ...f,
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "",
      page: 1,
    }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterForm((f) => ({
      ...f,
      sort: e.target.value,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((f) => ({
      ...f,
      page: newPage,
    }));
  };

  const handleAddToCompare = (productId: number) => {
    setCompareList((prev) => {
      if (prev.includes(productId)) return prev;
      const updated = [...prev, productId];
      localStorage.setItem("compareList", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveFromCompare = (productId: number) => {
    setCompareList((prev) => {
      const updated = prev.filter((id) => id !== productId);
      localStorage.setItem("compareList", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="p-6 bg-bg min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-accent">Магазин</h1>
      <div className="flex gap-8">
        {/* Фільтри зліва */}
        <aside className="w-full max-w-xs md:w-64 bg-card rounded-xl shadow p-6 mb-8 flex flex-col gap-4">
          <div>
            <label className="block text-dark font-semibold mb-1">Категорія</label>
            <select
              name="category"
              value={filterForm.category}
              onChange={handleFilterFormChange}
              className="select-main w-full"
            >
              <option value="">Всі</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-dark font-semibold mb-1">Мін. ціна</label>
            <input
              type="number"
              name="minPrice"
              value={filterForm.minPrice}
              onChange={handleFilterFormChange}
              className="input-main w-full"
              min={0}
            />
          </div>
          <div>
            <label className="block text-dark font-semibold mb-1">Макс. ціна</label>
            <input
              type="number"
              name="maxPrice"
              value={filterForm.maxPrice}
              onChange={handleFilterFormChange}
              className="input-main w-full"
              min={0}
            />
          </div>
          <div>
            <label className="block text-dark font-semibold mb-1">Сортування</label>
            <select
              name="sort"
              value={filterForm.sort}
              onChange={handleSortChange}
              className="select-main w-full"
            >
              <option value="">За новизною</option>
              <option value="price_asc">Ціна: зростання</option>
              <option value="price_desc">Ціна: спадання</option>
              <option value="rating_desc">Рейтинг: спадання</option>
              <option value="rating_asc">Рейтинг: зростання</option>
            </select>
          </div>
          <button className="btn-main w-full" onClick={handleApplyFilters}>
            Застосувати фільтри
          </button>
          <button className="btn-outline w-full" onClick={handleResetFilters}>
            Скинути
          </button>
        </aside>
        {/* Товари справа */}
        <main className="flex-1">
          {/* Кнопка для переходу на сторінку порівняння */}
          {compareList.length > 1 && (
            <div className="mb-4">
              <button
                className="btn-main"
                onClick={() => navigate("/compare")}
              >
                Порівняти вибрані товари ({compareList.length})
              </button>
            </div>
          )}
          {products.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Товарів не знайдено</div>
          ) : (
            <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {products.map((product) => (
                <li key={product.id} className="border p-4 rounded shadow bg-card text-dark">
                  {/* Кнопки іконками */}
                  <div className="flex items-center mb-2 gap-2">
                    <button
                      className={`btn-outline flex items-center justify-center w-10 h-10 p-0 ${compareList.includes(product.id) ? "bg-accent text-white" : ""}`}
                      title={compareList.includes(product.id) ? "В порівнянні" : "Додати до порівняння"}
                      onClick={() =>
                        compareList.includes(product.id)
                          ? handleRemoveFromCompare(product.id)
                          : handleAddToCompare(product.id)
                      }
                    >
                      <span role="img" aria-label="Порівняння" className="text-xl">⚖️</span>
                    </button>
                    <button
                      className="btn-main flex items-center justify-center w-10 h-10 p-0"
                      title="Додати до кошика"
                      onClick={() =>
                        addToCart({
                          product_id: product.id,
                          name: product.name,
                          price: product.price,
                          quantity: 1,
                        })
                      }
                    >
                      <span role="img" aria-label="Кошик" className="text-xl">🛒</span>
                    </button>
                  </div>
                  <Link to={`/product/${product.id}`}>
                    {product.image_url && (
                      <div className="flex justify-center items-center mb-2">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-auto h-52 object-contain bg-white rounded"
                        />
                      </div>
                    )}
                    <h2 className="text-lg font-semibold text-header">{product.name}</h2>
                  </Link>
                  <p className="text-header">
                    {product.description
                      ? product.description.length > 100
                        ? product.description.slice(0, 100) + "..."
                        : product.description
                      : ""}
                  </p>
                  <p className="text-header">
                    Ціна: <span className="text-accent">{product.price}</span>
                  </p>
                  {"rating" in product && (
                    <p className="text-header">
                      Рейтинг: <span className="text-accent">{(product as any).rating ?? "-"}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          {/* Пагінація */}
          <div className="flex gap-2 mt-8 justify-center">
            <button
              className="btn-outline"
              disabled={filters.page <= 1}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              &lt; Назад
            </button>
            <span className="px-3 py-2 rounded bg-white text-dark font-semibold">
              Сторінка {filters.page}
            </span>
            <button
              className="btn-outline"
              disabled={products.length < filters.limit}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              Вперед &gt;
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shop;
