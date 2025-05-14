import { useEffect, useState } from "react";
import axios from "axios";
import { Product } from "../../types/types";
import { useCart } from "../context/CartContext";
import Cart from "../components/Cart";
import OrderForm from "../components/OrderForm";

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    axios
      .get<Product[]>("/api/products", { headers })
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error(err);
        alert("Не вдалося отримати товари.");
      });
  }, []);

  if (products.length === 0) {
    return <div className="p-6">Завантаження товарів...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Магазин</h1>

      <Cart />
      <OrderForm />

      <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <li key={product.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p>{product.description}</p>
            <p>Ціна: {product.price}</p>
            <button
              className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
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
    </div>
  );
};

export default Shop;
