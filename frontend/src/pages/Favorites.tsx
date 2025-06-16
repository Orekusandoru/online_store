import { useEffect, useState } from "react";
import { Product } from "../../types/types";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

const Favorites = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const [favoritesList, setFavoritesList] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      if (token) {
        try {
          const res = await axios.get<Product[]>("/api/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProducts(res.data);
          setFavoritesList(res.data.map((p) => p.id));
        } catch {
          setProducts([]);
          setFavoritesList([]);
        }
      } else {
        const fav = localStorage.getItem("favoritesList");
        let ids: number[] = [];
        if (fav) {
          try {
            const parsed = JSON.parse(fav);
            if (Array.isArray(parsed)) {
              ids = parsed;
            } else if (typeof parsed === "number") {
              ids = [parsed];
            }
          } catch {
            ids = [];
          }
        }
        setFavoritesList(ids);
        console.log("Favorites IDs from localStorage:", ids);
        if (ids.length === 0) {
          setProducts([]);
        } else {
          try {
            const productsArr = await Promise.all(
              ids.map(async (id) => {
                try {
                  const res = await axios.get<Product>(`/api/products/${id}`);
                  return res.data;
                } catch {
                  return null;
                }
              })
            );
            setProducts(productsArr.filter((p): p is Product => p !== null));
          } catch {
            setProducts([]);
          }
        }
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [token]);

  const handleRemoveFromFavorites = async (productId: number) => {
    if (token) {
      try {
        await axios.delete("/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
          params: { productId },
        });
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setFavoritesList((prev) => prev.filter((id) => id !== productId));
      } catch {}
    } else {
      const updated = favoritesList.filter((id) => id !== productId);
      setFavoritesList(updated);
      localStorage.setItem("favoritesList", JSON.stringify(updated));
      window.dispatchEvent(new Event("favoritesChanged"));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Завантаження...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-accent">Обране</h1>
      {products.length === 0 ? (
        <div className="text-light text-3xl text-center">
          У вас немає вибраних товарів.
        </div>
      ) : (
        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="border p-4 rounded shadow bg-card text-dark"
            >
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
                  className="text-lg font-semibold text-header line-clamp-2 min-h-[2.7em]"
                  title={product.name}
                >
                  {product.name}
                </h2>
              </Link>
              <div className="flex items-center justify-between mt-2 mb-1">
                <span className="text-2xl font-bold bg-yellow-200 rounded-lg px-2 py-1 shadow-sm border border-yellow-200/60 tracking-wide flex items-center gap-1 text-dark">
                  {product.price}
                  <span className="font-bold text-[1.1em] ml-1 text-dark">₴</span>
                </span>
                <button
                  className="btn-outline ml-2"
                  title="Видалити з обраного"
                  onClick={() => handleRemoveFromFavorites(product.id)}
                >
                  <span
                    role="img"
                    aria-label="Видалити з обраного"
                    className="text-xl"
                  >
                    ❌
                  </span>
                </button>
              </div>
              <button
                className="btn-main w-full mt-2"
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
                Додати до кошика
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
