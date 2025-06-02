import { useEffect, useState } from "react";
import axios from "axios";
import { Product, NewProduct, Category } from "../../types/types";
  
const DashboardProducts = () => {
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: 0,
    category_id: 0,
    image_url: ""
  });
  

  const [error, setError] = useState<string>("");
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
  
    axios.get<Product[]>("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      setProducts(response.data);
    })
    .catch(() => {
      setError("Не вдалося отримати товари.");
    });

    axios.get<Category[]>("/api/categories", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      setCategories(response.data);
    })
    .catch(() => {
    
    });
  }, []);
  

  const handleAddProduct = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;
  
      const response = await axios.post<Product>("/api/products", newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      setProducts([...products, response.data]);
      setNewProduct({  
                    name: "",
                    description: "",
                    price: 0,
                    category_id: 0,
                    image_url: "" });
    } catch (error) {
      setError("Не вдалося додати товар.");
    }
  };
  

  const handleDeleteProduct = async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      setError("Не вдалося видалити товар.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 ">
      <h1 className="text-3xl font-bold mb-8 text-center text-accent drop-shadow">Управління товарами</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="bg-dark rounded-xl shadow-lg p-6 mb-8 max-w-2xl mx-auto">
        <div className="flex flex-col gap-3">
          <label className="text-dark font-semibold">Назва товару</label>
          <input
            className="input-main"
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder="Назва товару"
          />
          <label className="text-dark font-semibold">Опис товару</label>
          <input
            className="input-main"
            type="text"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            placeholder="Опис товару"
          />
          <label className="text-dark font-semibold">Ціна</label>
          <input
            className="input-main"
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
            placeholder="Ціна"
          />
          <label className="text-dark font-semibold">Категорія</label>
          <select
            className="select-main"
            value={newProduct.category_id}
            onChange={e => setNewProduct({ ...newProduct, category_id: parseInt(e.target.value) })}
          >
            <option value={0}>Оберіть категорію</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <label className="text-dark font-semibold">URL зображення</label>
          <input
            className="input-main"
            type="text"
            value={newProduct.image_url}
            onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
            placeholder="URL зображення"
          />
          <label className="text-dark font-semibold">Завантажити зображення</label>
          <input
            className="input-main"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const formData = new FormData();
              formData.append("image", file);
              try {
                const token = sessionStorage.getItem("token");
                const res = await axios.post<{ url: string }>("/api/upload", formData, {
                  headers: {
                    "Content-Type": "multipart/form-data",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                });
                setNewProduct((p) => ({ ...p, image_url: res.data.url }));
              } catch {
                setError("Не вдалося завантажити зображення");
              }
            }}
          />
          <button onClick={handleAddProduct} className="btn-main mt-2 self-end">
            Додати товар
          </button>
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map(product => (
          <li key={product.id} className="bg-dark text-white p-4 rounded-xl shadow border border-accent/30 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-accent">Назва:</span>
                  <span className="ml-2">{product.name}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">Опис:</span>
                  <span className="ml-2">{product.description}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">Ціна:</span>
                  <span className="ml-2">{product.price}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">Категорія:</span>
                  <span className="ml-2">
                    {categories.find(c => c.id === product.category_id)?.name || product.category_id}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-accent">Картинка:</span>
                  <a href={product.image_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-accent break-all underline">{product.image_url}</a>
                </div>
                <div>
                  <span className="font-semibold text-accent">Створено:</span>
                  <span className="ml-2">{new Date(product.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">Оновлено:</span>
                  <span className="ml-2">{new Date(product.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <button onClick={() => handleDeleteProduct(product.id)} className="btn-outline mt-4 self-end">
              Видалити
            </button>
          </li> 
        ))}
      </ul>
    </div>
  );
};

export default DashboardProducts;
