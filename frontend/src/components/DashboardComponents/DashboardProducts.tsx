import { useEffect, useState } from "react";
import axios from "axios";
import { Product, NewProduct, Category } from "../../../types/types";
import ProductFields from "./ProductFields";

const DashboardProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: 0,
    category_id: 0,
    image_url: "",
    screen_size: undefined,
    resolution: "",
    ram: undefined,
    storage: undefined,
    processor: "",
    battery: undefined,
    refresh_rate: undefined,
  });

  const [error, setError] = useState<string>("");
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    axios
      .get<Product[]>("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setProducts(response.data);
      })
      .catch(() => {
        setError("Не вдалося отримати товари.");
      });

    axios
      .get<Category[]>("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCategories(response.data);
      })
      .catch(() => {});
  }, []);

  const handleAddProduct = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const response = await axios.post<Product>("/api/products", newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts([...products, response.data]);
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        category_id: 0,
        image_url: "",
        resolution: "",
        processor: "",

        screen_size: undefined,
        ram: undefined,
        storage: undefined,
        battery: undefined,
        refresh_rate: undefined,
      });
    } catch (error) {
      setError("Не вдалося додати товар.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      setError("Не вдалося видалити товар.");
    }
  };

  const handleUpdateProduct = async (id: number, updated: Partial<NewProduct>) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      const response = await axios.patch<Product>(`/api/products/${id}`, updated, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, ...response.data } : product
        )
      );
    } catch (error) {
      setError("Не вдалося оновити товар.");
    }
  };

  const handleEditClick = (product: Product) => {
    setEditProductId(product.id);
    setEditProduct({ ...product });
  };

  const handleEditFieldChange = (field: keyof Product, value: any) => {
    setEditProduct((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSaveEdit = async () => {
    if (!editProductId || !editProduct) return;
    await handleUpdateProduct(editProductId, editProduct);
    setEditProductId(null);
    setEditProduct(null);
  };

  const handleCancelEdit = () => {
    setEditProductId(null);
    setEditProduct(null);
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.post<{ url: string }>(
        "/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      setEditProduct((prev) => prev ? { ...prev, image_url: res.data.url } : prev);
    } catch {
      setError("Не вдалося завантажити зображення");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-2 ">
      <h1 className="text-3xl font-bold mb-8 text-center text-accent drop-shadow">
        Управління товарами
      </h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <ul className="bg-card rounded-xl shadow-lg p-6 mb-8 max-w-5xl mx-auto list-none">
        <form
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddProduct();
          }}
        >
          <ProductFields
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            categories={categories}
            setError={setError}
          />
          <li className="md:col-span-4 flex justify-end">
            <button type="submit" className="btn-main mt-2">
              Додати товар
            </button>
          </li>
        </form>
      </ul>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <li
            key={product.id}
            className="bg-card text-dark p-4 rounded-xl shadow border border-accent/30 flex flex-col gap-3"
          >
            {editProductId === product.id && editProduct ? (
              <form
                className="space-y-2"
                onSubmit={e => {
                  e.preventDefault();
                  handleSaveEdit();
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">Назва</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      value={editProduct.name ?? ""}
                      onChange={e => handleEditFieldChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">Опис</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      value={editProduct.description ?? ""}
                      onChange={e => handleEditFieldChange("description", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">Ціна</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      type="number"
                      value={editProduct.price ?? ""}
                      onChange={e => handleEditFieldChange("price", parseFloat(e.target.value))}
                      required
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">Категорія</label>
                    <select
                      className="select-main text-sm py-1 h-10 w-full"
                      value={editProduct.category_id ?? 0}
                      onChange={e => handleEditFieldChange("category_id", parseInt(e.target.value))}
                      required
                    >
                      <option value={0}>Оберіть категорію</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">URL зображення</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      value={editProduct.image_url ?? ""}
                      onChange={e => handleEditFieldChange("image_url", e.target.value)}
                      required
                    />
                    <label className="font-semibold text-header text-sm block text-left mt-2">Завантажити нове зображення</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                    />
                    {editProduct.image_url && (
                      <div className="mt-2 flex justify-center">
                        <img
                          src={editProduct.image_url}
                          alt="Фото товару"
                          className="w-32 h-32 object-contain bg-white rounded shadow"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">Діагональ екрана</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      type="number"
                      value={editProduct.screen_size ?? ""}
                      onChange={e => handleEditFieldChange("screen_size", e.target.value ? parseFloat(e.target.value) : undefined)}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">Роздільна здатність</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      value={editProduct.resolution ?? ""}
                      onChange={e => handleEditFieldChange("resolution", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">RAM (ГБ)</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      type="number"
                      value={editProduct.ram ?? ""}
                      onChange={e => handleEditFieldChange("ram", e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">Накопичувач (ГБ)</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      type="number"
                      value={editProduct.storage ?? ""}
                      onChange={e => handleEditFieldChange("storage", e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">Процесор</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      value={editProduct.processor ?? ""}
                      onChange={e => handleEditFieldChange("processor", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">Батарея (мА·г)</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      type="number"
                      value={editProduct.battery ?? ""}
                      onChange={e => handleEditFieldChange("battery", e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-header text-sm block text-left">Частота оновлення (Гц)</label>
                    <input
                      className="input-main text-sm py-1 h-8 w-full"
                      type="number"
                      value={editProduct.refresh_rate ?? ""}
                      onChange={e => handleEditFieldChange("refresh_rate", e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-2 self-end">
                  <button type="submit" className="btn-main">Зберегти</button>
                  <button type="button" className="btn-outline" onClick={handleCancelEdit}>Скасувати</button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="bg-gray-50 rounded-lg px-4 py-2 flex flex-col gap-1 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-accent w-36">Назва:</span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    
                      <DescriptionToggle description={product.description} />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-accent w-36">Ціна:</span>
                        <span className="font-bold bg-yellow-100 rounded px-2 py-1">{product.price} ₴</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-accent w-36">Категорія:</span>
                        <span>
                          {categories.find((c) => c.id === product.category_id)?.name || product.category_id}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-4 py-2 flex flex-wrap gap-3 shadow-sm">
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-accent text-xs">Діагональ екрана</span>
                        <span>{product.screen_size ?? "-"}</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-accent text-xs">Роздільна здатність</span>
                        <span>{product.resolution ?? "-"}</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-accent text-xs">RAM</span>
                        <span>{product.ram ?? "-"}</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-accent text-xs">Накопичувач</span>
                        <span>{product.storage ?? "-"}</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-accent text-xs">Процесор</span>
                        <span>{product.processor ?? "-"}</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-accent text-xs">Батарея</span>
                        <span>{product.battery ?? "-"}</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-accent text-xs">Частота оновлення</span>
                        <span>{product.refresh_rate ?? "-"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 items-center justify-center">
                    <div className="w-full flex flex-col items-center">
                      <span className="font-semibold text-accent">Картинка:</span>
                      <a
                        href={product.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-accent break-all underline"
                      >
                        {product.image_url}
                      </a>
                      {product.image_url && (
                        <div className="mt-2 flex justify-center">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-32 h-32 object-contain bg-white rounded shadow"
                          />
                        </div>
                      )}
                    </div>
                    <div className="w-full flex flex-col items-start">
                      <span className="font-semibold text-accent">Створено:</span>
                      <span className="ml-2">{new Date(product.created_at).toLocaleString()}</span>
                    </div>
                    <div className="w-full flex flex-col items-start">
                      <span className="font-semibold text-accent">Оновлено:</span>
                      <span className="ml-2">{new Date(product.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 self-end">
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="btn-outline"
                  >
                    Видалити
                  </button>
                  <button
                    onClick={() => handleEditClick(product)}
                    className="btn-main"
                  >
                    Редагувати
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

function DescriptionToggle({ description }: { description: string }) {
  const [open, setOpen] = useState(false);
  if (!description) return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-accent w-36">Опис:</span>
      <span className="font-medium text-gray-400">-</span>
    </div>
  );
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-accent w-36">Опис:</span>
        <button
          type="button"
          className="text-accent underline text-sm"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Сховати" : "Показати"}
        </button>
      </div>
      {open && (
        <div className="bg-white rounded px-2 py-1 mt-1 border border-gray-200 text-sm">
          {description}
        </div>
      )}
    </div>
  );
}

export default DashboardProducts;
