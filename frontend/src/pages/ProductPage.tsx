import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  rating?: number;
  rating_count?: number;
  screen_size?: number;
  resolution?: string;
  ram?: number;
  storage?: number;
  processor?: string;
  battery?: number;
  refresh_rate?: number;
};

type Review = {
  id: number;
  user_id: number;
  user_name?: string;
  rating: number;
  comment: string;
  created_at: string;
};

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState<number>(0);
  const [myComment, setMyComment] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [favoritesList, setFavoritesList] = useState<number[]>(() => {
    const stored = localStorage.getItem("favoritesList");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      axios
        .get<Product>(`/api/products/${id}`)
        .then((res) => setProduct(res.data)),
      axios
        .get<Review[]>(`/api/products/${id}/reviews`)
        .then((res) => setReviews(res.data)),
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) return alert("Увійдіть для відгуку");
    await axios.post(
      `/api/products/${id}/reviews`,
      { rating: myRating, comment: myComment },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setMyRating(0);
    setMyComment("");
    axios
      .get<Review[]>(`/api/products/${id}/reviews`)
      .then((res) => setReviews(res.data));
    axios
      .get<Product>(`/api/products/${id}`)
      .then((res) => setProduct(res.data));
  };

  const handleAddToFavorites = (productId: number) => {
    setFavoritesList((prev) => {
      if (prev.includes(productId)) return prev;
      const updated = [...prev, productId];
      localStorage.setItem("favoritesList", JSON.stringify(updated));
      window.dispatchEvent(new Event("favoritesChanged"));
      return updated;
    });
  };

  const handleRemoveFromFavorites = (productId: number) => {
    setFavoritesList((prev) => {
      const updated = prev.filter((id) => id !== productId);
      localStorage.setItem("favoritesList", JSON.stringify(updated));
      window.dispatchEvent(new Event("favoritesChanged"));
      return updated;
    });
  };

  if (loading || !product) return <div className="p-6">Завантаження...</div>;

  const characteristics: {
    label: string;
    value: string | number | undefined;
  }[] = [
    { label: "Діагональ екрана", value: product.screen_size },
    { label: "Роздільна здатність", value: product.resolution },
    { label: "RAM (ГБ)", value: product.ram },
    { label: "Накопичувач (ГБ)", value: product.storage },
    { label: "Процесор", value: product.processor },
    { label: "Батарея (мА·г)", value: product.battery },
    { label: "Частота оновлення (Гц)", value: product.refresh_rate },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto rounded-2xl bg-card-secondary ">
      <h1 className="text-2xl font-bold mb-6 text-center">{product.name}</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-64 h-64 object-contain bg-white rounded shadow"
            />
          )}
          <div className="flex flex-col items-center gap-2 mt-6 w-full">
            <div className="bg-white rounded px-6 py-3 text-lg font-bold text-accent shadow w-full text-center">
              Ціна: {product.price} ₴
            </div>

            <div className="mb-2  text-dark font-semibold w-full text-center">
              {product.rating
                ? `★ ${product.rating} (${product.rating_count})`
                : "Без рейтингу"}
            </div>
            <div className="flex gap-2 justify-center w-full">
              <button
                className="btn-main"
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
          </div>
        </div>

        <div className="flex-1">
          <div className="font-semibold mb-1">Опис</div>
          <div className="bg-white rounded-2xl mb-4">
            <div>{product.description}</div>
          </div>

          <div className="mb-4">
            <div className="font-semibold mb-1">Характеристики</div>
            <table className="min-w-full bg-white rounded shadow">
              <tbody>
                {characteristics.map(
                  (c) =>
                    c.value !== undefined &&
                    c.value !== "" && (
                      <tr key={c.label}>
                        <td className="py-1 px-2 font-semibold text-header">
                          {c.label}
                        </td>
                        <td className="py-1 px-2 text-dark">{c.value}</td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Відгуки</h2>
        <form
          onSubmit={handleReviewSubmit}
          className="mb-6 bg-white rounded p-3 shadow flex flex-col gap-2"
        >
          <label className="font-semibold text-dark">Ваша оцінка:</label>
          <div className="flex justify-center mb-2 gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`text-4xl ${
                  myRating >= star ? "text-yellow-400" : "text-gray-300"
                }`}
                onClick={() => setMyRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="input-main"
            placeholder="Ваш відгук"
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            rows={3}
          />
          <button
            className="btn-main self-end"
            type="submit"
            disabled={myRating === 0}
          >
            Залишити відгук
          </button>
        </form>
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="bg-card  rounded p-3 shadow">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-dark">
                  {r.user_name || "Користувач"}
                </span>
                <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
                <span className="text-xs text-gray-500">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-start ">{r.comment}</div>
            </li>
          ))}
          {reviews.length === 0 && (
            <li className="text-gray-500">Відгуків ще немає</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProductPage;
