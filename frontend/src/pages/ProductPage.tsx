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

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      axios.get<Product>(`/api/products/${id}`).then(res => setProduct(res.data)),
      axios.get<Review[]>(`/api/products/${id}/reviews`).then(res => setReviews(res.data))
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) return alert("Увійдіть для відгуку");
    await axios.post(`/api/products/${id}/reviews`, { rating: myRating, comment: myComment }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMyRating(0);
    setMyComment("");
    axios.get<Review[]>(`/api/products/${id}/reviews`).then(res => setReviews(res.data));
    axios.get<Product>(`/api/products/${id}`).then(res => setProduct(res.data));
  };

  if (loading || !product) return <div className="p-6">Завантаження...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} className="w-64 h-64 object-contain bg-white rounded shadow" />
        )}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <div className="mb-2 text-accent font-semibold">
            {product.rating ? `★ ${product.rating} (${product.rating_count})` : "Без рейтингу"}
          </div>
          <div className="mb-2 text-lg font-bold">Ціна: {product.price} ₴</div>
          <div className="mb-4">{product.description}</div>
          <button className="btn-main" onClick={() => addToCart({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          })}>
            Додати до кошика
          </button>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Відгуки</h2>
        <form onSubmit={handleReviewSubmit} className="mb-6 bg-white rounded p-4 shadow flex flex-col gap-2">
          <label className="font-semibold">Ваша оцінка:</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(star => (
              <button
                type="button"
                key={star}
                className={`text-2xl ${myRating >= star ? "text-yellow-400" : "text-gray-300"}`}
                onClick={() => setMyRating(star)}
              >★</button>
            ))}
          </div>
          <textarea
            className="input-main"
            placeholder="Ваш відгук"
            value={myComment}
            onChange={e => setMyComment(e.target.value)}
            rows={3}
          />
          <button className="btn-main self-end" type="submit" disabled={myRating === 0}>
            Залишити відгук
          </button>
        </form>
        <ul className="space-y-4">
          {reviews.map(r => (
            <li key={r.id} className="bg-bg  rounded p-3 shadow">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-accent">{r.user_name || "Користувач"}</span>
                <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
                <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <div>{r.comment}</div>
            </li>
          ))}
          {reviews.length === 0 && <li className="text-gray-500">Відгуків ще немає</li>}
        </ul>
      </div>
    </div>
  );
};

export default ProductPage;
