import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Product } from "../../types/types";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import React from "react";

type Category = { id: number; name: string };

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { addToCart } = useCart();
  const [compareList, setCompareList] = useState<number[]>(() => {
    const stored = localStorage.getItem("compareList");
    return stored ? JSON.parse(stored) : [];
  });
  const [favoritesList, setFavoritesList] = useState<number[]>(() => {
    const stored = localStorage.getItem("favoritesList");
    return stored ? JSON.parse(stored) : [];
  });
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

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
  const [recommended, setRecommended] = useState<Product[]>([]);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(filterForm.minPrice) || 0,
    Number(filterForm.maxPrice) || 50000,
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const didFetch = useRef(false);
  const didFetchCategories = useRef(false);

  useEffect(() => {
    if (didFetchCategories.current) return;
    didFetchCategories.current = true;
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        // Try cache first
        const cached = localStorage.getItem("categoriesCache");
        if (cached) {
          setCategories(JSON.parse(cached));
          return;
        }
        const res = await axios.get<Category[]>("/api/categories", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!cancelled) {
          if (
            Array.isArray(res.data) &&
            res.data.length &&
            res.data[0].id &&
            res.data[0].name
          ) {
            setCategories(res.data);
            localStorage.setItem("categoriesCache", JSON.stringify(res.data));
          } else {
            setCategories([]);
          }
        }
      } catch (err: any) {
        if (!cancelled) setCategories([]);
       
      }
    };
    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [token]);

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
        setTotalPages(
          res.data.length < filters.limit ? filters.page : filters.page + 1
        );
        setErrorMsg(null);
      })
      .catch((err) => {
        if (err?.response?.status === 429) {
          setErrorMsg("Забагато запитів. Спробуйте пізніше.");
        } else {
          setErrorMsg("Помилка завантаження товарів.");
        }
        setProducts([]);
      });
  }, [filters]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setRecommended([]);
        return;
      }
      try {
        const ordersRes = await axios.get<{ items: { product_id: number }[] }[]>(
          "/api/my-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const allProductIds: number[] = [];
        ordersRes.data.forEach((order) => {
          order.items.forEach((item) => allProductIds.push(item.product_id));
        });

        const freq: Record<number, number> = {};
        allProductIds.forEach((id) => {
          freq[id] = (freq[id] || 0) + 1;
        });

        const sortedIds = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .map(([id]) => Number(id))
          .slice(0, 6);

        sessionStorage.setItem("recommendedOrderedIds", JSON.stringify(sortedIds));

        if (sortedIds.length > 0) {
        
          const recRes = await axios.get<Product[]>("/api/products", {
            params: { ids: sortedIds.join(",") },
          });
          let recommendedProducts = recRes.data;

          if (recommendedProducts.length < 6) {
       
            const allRes = await axios.get<Product[]>("/api/products", {
              params: { limit: 50 },
            });
            const all = allRes.data.filter(
              (p) => !sortedIds.includes(p.id)
            );
            
            const shuffled = all.sort(() => 0.5 - Math.random());
            recommendedProducts = [
              ...recommendedProducts,
              ...shuffled.slice(0, 6 - recommendedProducts.length),
            ];
          }
          setRecommended(recommendedProducts);
        } else {
        
          const allRes = await axios.get<Product[]>("/api/products", {
            params: { limit: 50 },
          });
          const all = allRes.data;
          const shuffled = all.sort(() => 0.5 - Math.random());
          setRecommended(shuffled.slice(0, 6));
        }
      } catch {
        setRecommended([]);
      }
    };
    fetchRecommendations();
  }, [token]);

  const handleFilterFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      window.dispatchEvent(new Event("compareListChanged"));
      return updated;
    });
  };

  const handleRemoveFromCompare = (productId: number) => {
    setCompareList((prev) => {
      const updated = prev.filter((id) => id !== productId);
      localStorage.setItem("compareList", JSON.stringify(updated));
      window.dispatchEvent(new Event("compareListChanged"));
      return updated;
    });
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      if (token) {
        try {
          const res = await axios.get("/api/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const ids = (res.data as Product[]).map((p: Product) => p.id);
          setFavoritesList(ids);

          localStorage.setItem("favoritesList", JSON.stringify(ids));
        } catch {
          setFavoritesList([]);
          localStorage.setItem("favoritesList", "[]");
        }
      }
    };
    fetchFavorites();
  }, [token]);

  const handleAddToFavorites = async (productId: number) => {
    if (token) {
      try {
        await axios.post(
          "/api/favorites",
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const res = await axios.get("/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data as Product[];
        const ids = data.map((p: Product) => p.id);
        setFavoritesList(ids);
        localStorage.setItem("favoritesList", JSON.stringify(ids));
      } catch (e) {
        console.error("Add to favorites error:", e);
      }
    } else {
      setFavoritesList((prev) => {
        if (prev.includes(productId)) return prev;
        const updated = [...prev, productId];
        localStorage.setItem("favoritesList", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleRemoveFromFavorites = async (productId: number) => {
    if (token) {
      try {
        await axios.delete("/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
          params: { productId },
        });

        const res = await axios.get("/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ids = (res.data as Product[]).map((p: Product) => p.id);
        setFavoritesList(ids);
        localStorage.setItem("favoritesList", JSON.stringify(ids));
      } catch {}
    } else {
      setFavoritesList((prev) => {
        const updated = prev.filter((id) => id !== productId);
        localStorage.setItem("favoritesList", JSON.stringify(updated));
        return updated;
      });
    }
  };

  useEffect(() => {
    window.dispatchEvent(new Event("favoritesChanged"));
  }, [favoritesList]);

  const handlePriceRangeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: 0 | 1
  ) => {
    let newRange: [number, number] = [...priceRange];
    newRange[idx] = Number(e.target.value);

    if (newRange[0] > newRange[1]) {
      if (idx === 0) newRange[1] = newRange[0];
      else newRange[0] = newRange[1];
    }
    setPriceRange(newRange);
    setFilterForm((f) => ({
      ...f,
      minPrice: newRange[0].toString(),
      maxPrice: newRange[1].toString(),
    }));
  };

  return (
    <div className=" bg-bg min-h-screen">
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
          {errorMsg}
        </div>
      )}
      {recommended.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 text-light">
            Рекомендовано для вас
          </h2>
          <div className="overflow-x-auto">
            <ul className="flex gap-4 pb-2" style={{ minHeight: 220 }}>
              {(() => {
             
                let orderedIds: number[] = [];
                try {
                  const stored = sessionStorage.getItem("recommendedOrderedIds");
                  if (stored) orderedIds = JSON.parse(stored);
                } catch {}
                const orderedSet = new Set(orderedIds);
                const ordered = recommended.filter(p => orderedSet.has(p.id));
                const rest = recommended.filter(p => !orderedSet.has(p.id));
              
                const orderedSorted = orderedIds
                  .map(id => ordered.find(p => p.id === id))
                  .filter(Boolean) as typeof recommended;
                const finalList = [...orderedSorted, ...rest];
                return finalList.map((product) => (
                  <li
                    key={product.id}
                    className="min-w-[220px] max-w-[220px] border p-3 rounded shadow bg-card text-dark flex flex-col items-center"
                    style={{ flex: "0 0 220px" }}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="w-full flex flex-col items-center"
                    >
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-32 h-32 object-contain bg-white rounded mb-2"
                        />
                      )}
                      <h3 className="text-base font-semibold text-header text-center mb-1 truncate w-full">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-yellow-400 text-lg">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {product.rating >= i + 1
                              ? "★"
                              : product.rating > i
                              ? "★"
                              : "☆"}
                          </span>
                        ))}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.rating_count})
                      </span>
                    </div>
                    <span className="text-lg font-bold bg-yellow-200 rounded-lg px-2 py-1 shadow-sm border border-yellow-200/60 tracking-wide flex items-center gap-1 text-dark mb-2">
                      {product.price}
                      <span className="font-bold text-[1.1em] ml-1 text-dark">
                        ₴
                      </span>
                    </span>
                    <Link
                      to={`/product/${product.id}`}
                      className="btn-main w-full text-center py-1 px-2 text-sm"
                    >
                      Детальніше
                    </Link>
                  </li>
                ));
              })()}
            </ul>
          </div>
        </div>
      )}
      <div className="flex gap-8">
        <aside className="w-full max-w-xs md:w-64 bg-card rounded-xl shadow p-6 mb-8 flex flex-col gap-4">
          <div>
            <label className="block text-dark font-semibold mb-1">
              Категорія
            </label>
            <select
              name="category"
              value={filterForm.category}
              onChange={handleFilterFormChange}
              className="select-main w-full"
              disabled={categories.length === 0}
            >
              <option value="">Всі</option>
              {categories.length === 0 ? (
                <option disabled>Завантаження...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )
            }
            </select>
            {categories.length === 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Категорії не знайдено
              </div>
            )}
          </div>

          <div>
            <label className="block text-dark font-semibold mb-1">
              Діапазон цін
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={100}
                  value={priceRange[0]}
                  onChange={(e) => handlePriceRangeChange(e, 0)}
                  className="w-full"
                />
                <span className="text-sm text-dark w-16 text-right">
                  {priceRange[0]} ₴
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={100}
                  value={priceRange[1]}
                  onChange={(e) => handlePriceRangeChange(e, 1)}
                  className="w-full"
                />
                <span className="text-sm text-dark w-16 text-right">
                  {priceRange[1]} ₴
                </span>
              </div>
              <div className="text-xs text-gray-500 text-center">
                Від {priceRange[0]} ₴ до {priceRange[1]} ₴
              </div>
            </div>
          </div>
          <div>
            <label className="block text-dark font-semibold mb-1">
              Сортування
            </label>
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
          <button className="btn-main  w-full" onClick={handleApplyFilters}>
            Застосувати фільтри
          </button>
          <button className="btn-outline w-full" onClick={handleResetFilters}>
            Скинути
          </button>
        </aside>

        <main className="flex-1">
          {compareList.length > 1 && (
            <div className="mb-4">
              <button className="btn-main" onClick={() => navigate("/compare")}>
                Порівняти вибрані товари ({compareList.length})
              </button>
            </div>
          )}
          {products.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Товарів не знайдено
            </div>
          ) : (
            <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="border p-4 rounded shadow bg-card text-dark"
                >
                  <div className="flex items-center mb-2 gap-2">
                    <button
                      className={`btn-outline flex items-center justify-center w-10 h-10 p-0 ${
                        compareList.includes(product.id)
                          ? "bg-accent text-white"
                          : ""
                      }`}
                      title={
                        compareList.includes(product.id)
                          ? "В порівнянні"
                          : "Додати до порівняння"
                      }
                      onClick={() =>
                        compareList.includes(product.id)
                          ? handleRemoveFromCompare(product.id)
                          : handleAddToCompare(product.id)
                      }
                    >
                      <span
                        role="img"
                        aria-label="Порівняння"
                        className="text-xl"
                      >
                        ⚖️
                      </span>
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
                          image_url: product.image_url || "", 
                        })
                      }
                    >
                      <span role="img" aria-label="Кошик" className="text-xl">
                        🛒
                      </span>
                    </button>
                    <button
                      className={`btn-outline flex items-center justify-center w-10 h-10 p-0 ${
                        favoritesList.includes(product.id)
                          ? "bg-accent text-white"
                          : ""
                      }`}
                      title={
                        favoritesList.includes(product.id)
                          ? "В обраному"
                          : "Додати до обраного"
                      }
                      onClick={() =>
                        favoritesList.includes(product.id)
                          ? handleRemoveFromFavorites(product.id)
                          : handleAddToFavorites(product.id)
                      }
                    >
                      <span role="img" aria-label="Обране" className="text-xl">
                        ⭐
                      </span>
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
                    <h2
                      className="text-lg font-semibold text-header line-clamp-2 leading-tight min-h-[2.7em]"
                      title={product.name}
                    >
                      {product.name}
                    </h2>
                  </Link>
                  <div className="flex items-center justify-between mt-2 mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-lg">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {product.rating >= i + 1
                              ? "★"
                              : product.rating > i
                              ? "★"
                              : "☆"}
                          </span>
                        ))}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.rating_count})
                      </span>
                    </div>
                    <span className="text-2xl font-bold bg-yellow-200 rounded-lg px-2 py-1 shadow-sm border border-yellow-200/60 tracking-wide flex items-center gap-1 text-dark">
                      {product.price}
                      <span className="font-bold text-[1.1em] ml-1 text-dark">
                        ₴
                      </span>
                    </span>
                  </div>
                  <p className="text-header mb-2">
                    {product.description
                      ? product.description.length > 100
                        ? product.description.slice(0, 100) + "..."
                        : product.description
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}

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
