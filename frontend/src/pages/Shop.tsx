import { useEffect, useState } from "react";
import axios from "axios";
import { Product } from "../../types/types";
import { useCart } from "../context/CartContext";

type Category = { id: number; name: string };

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { addToCart } = useCart();

  
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

  return (
    <div className="p-6 bg-main min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-dark">Магазин</h1>
      {/* Фільтри */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-dark font-semibold mb-1">Категорія</label>
          <select
            name="category"
            value={filterForm.category}
            onChange={handleFilterFormChange}
            className="select-main"
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
            className="input-main"
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
            className="input-main"
            min={0}
          />
        </div>
        <div>
          <label className="block text-dark font-semibold mb-1">Сортування</label>
          <select
            name="sort"
            value={filterForm.sort}
            onChange={handleSortChange}
            className="select-main"
          >
            <option value="">За новизною</option>
            <option value="price_asc">Ціна: зростання</option>
            <option value="price_desc">Ціна: спадання</option>
            <option value="rating_desc">Рейтинг: спадання</option>
            <option value="rating_asc">Рейтинг: зростання</option>
          </select>
        </div>
        <button className="btn-main h-10 mt-6" onClick={handleApplyFilters}>
          Застосувати фільтри
        </button>
        <button className="btn-outline h-10 mt-6" onClick={handleResetFilters}>
          Скинути
        </button>
      </div>
      {/* Товари */}
      {products.length === 0 ? (
        <div className="p-6 text-center text-gray-500">Товарів не знайдено</div>
      ) : (
        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className=" border p-4 rounded shadow bg-dark">
              {product.image_url && (
                <div className="flex justify-center items-center mb-2">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-auto h-52 object-contain bg-white rounded"
                  />
                </div>
              )}
              <h2 className="text-lg font-semibold text-bg">{product.name}</h2>
              <p className="text-bg">{product.description}</p>
              <p className="text-bg">
                Ціна: <span className="text-accent">{product.price}</span>
              </p>
              {"rating" in product && (
                <p className="text-bg">
                  Рейтинг: <span className="text-accent">{(product as any).rating ?? "-"}</span>
                </p>
              )}
              <button
                className="btn-main mt-2"
                onClick={() =>
                  addToCart({
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                  })
                }
              >
                Додати до кошика
              </button>
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
    </div>
  );
};

export default Shop;
