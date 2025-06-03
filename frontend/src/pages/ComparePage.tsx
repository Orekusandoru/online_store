import { useEffect, useState } from "react";
import axios from "axios";
import { Product } from "../../types/types";
import { Link } from "react-router-dom";

const ComparePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const compareList: number[] = JSON.parse(localStorage.getItem("compareList") || "[]");
    if (compareList.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    axios
      .get<Product[]>("/api/products", { params: { ids: compareList.join(",") } })
      .then((res) => {
     
        setProducts(res.data.filter(p => compareList.includes(p.id)));
      })
      .then(() => setLoading(false));
  }, []);

  const handleRemove = (id: number) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem("compareList", JSON.stringify(updated.map((p) => p.id)));
  };

  if (loading) return <div className="p-6">Завантаження...</div>;
  if (products.length === 0) return <div className="p-6">Список порівняння порожній</div>;

 
  const fields = [
    { key: "name", label: "Назва" },
    { key: "price", label: "Ціна" },
    { key: "screen_size", label: "Діагональ екрана" },
    { key: "resolution", label: "Роздільна здатність" },
    { key: "ram", label: "RAM (ГБ)" },
    { key: "storage", label: "Накопичувач (ГБ)" },
    { key: "processor", label: "Процесор" },
    { key: "battery", label: "Батарея (мА·г)" },
    { key: "refresh_rate", label: "Частота оновлення (Гц)" },
    { key: "rating", label: "Рейтинг" },
  ];

  return (
    <div className="p-6 bg-main min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-light">Порівняння товарів</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr>
              <th className="p-3 border-b"></th>
              {products.map((p) => (
                <th key={p.id} className="p-3 border-b text-center">
                  <div className="flex flex-col items-center">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} className="w-24 h-24 object-contain mb-2 bg-white rounded" />
                    )}
                    <Link to={`/product/${p.id}`} className="font-semibold text-accent hover:underline">{p.name}</Link>
                    <button
                      className="btn-outline mt-2"
                      onClick={() => handleRemove(p.id)}
                    >
                      Видалити
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.key}>
                <td className="p-3 font-semibold text-dark border-b">{f.label}</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-dark text-center border-b">
                    {p[f.key as keyof Product] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="btn-outline mt-6"
        onClick={() => {
          localStorage.removeItem("compareList");
          setProducts([]);
        }}
      >
        Очистити список порівняння
      </button>
    </div>
  );
};

export default ComparePage;
