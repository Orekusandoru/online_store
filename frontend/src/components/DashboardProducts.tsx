import { useEffect, useState } from "react";
import axios from "axios";
import { Product, NewProduct } from "../../types/types";
  
const DashboardProducts = () => {
  
  const [products, setProducts] = useState<Product[]>([]);
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
    .catch(error => {
      setError("Не вдалося отримати товари.");
    });
  }, []);
  

  const handleAddProduct = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;
  
      const response = await axios.post<Product>("/api/products", newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      setProducts([...products, response.data]); // 👈 сюди ми додаємо продукт вже з id
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
    <div>
      <h1>Управління товарами</h1>
      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        value={newProduct.name}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        placeholder="Назва товару"
      />

      <input
        type="text"
        value={newProduct.description}
        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        placeholder="Опис товару"
       />

      <input
        type="number"
        value={newProduct.price}
        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
        placeholder="Ціна"
       />

      <input
        type="number"
        value={newProduct.category_id}
        onChange={(e) => setNewProduct({ ...newProduct, category_id: parseInt(e.target.value) })}
        placeholder="ID категорії"
      />

      <input
        type="text"
        value={newProduct.image_url}
        onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
        placeholder="URL зображення"
       />

      <button onClick={handleAddProduct}>Додати товар</button>
      <ul>
        {products.map(product => (
            <li key={product.id} className="mb-4">
            <p><strong>Назва:</strong> {product.name}</p>
            <p><strong>Опис:</strong> {product.description}</p>
            <p><strong>Ціна:</strong> {product.price}</p>
            <p><strong>Категорія ID:</strong> {product.category_id}</p>
            <p><strong>Картинка:</strong> <a href={product.image_url} target="_blank" rel="noopener noreferrer">{product.image_url}</a></p>
            <p><strong>Створено:</strong> {new Date(product.created_at).toLocaleString()}</p>
            <p><strong>Оновлено:</strong> {new Date(product.updated_at).toLocaleString()}</p>
            <button onClick={() => handleDeleteProduct(product.id)} className="mt-2 text-red-600">Видалити</button>
            </li>
        ))}
     </ul>

    </div>
  );
};

export default DashboardProducts;
