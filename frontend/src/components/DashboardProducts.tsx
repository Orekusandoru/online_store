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
          <li className="flex flex-col bg-bg rounded-lg p-4 shadow min-h-full gap-4 md:col-span-2">
            <div className="text-lg font-bold text-accent mb-2 text-center">
              Основні дані
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="font-semibold text-white text-sm block text-left">
                  Назва товару <span className="text-red-500">*</span>
                </label>
                <input
                  className="input-main text-sm py-1 h-8 w-full"
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Назва товару"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-white text-sm block text-left">
                  Опис товару <span className="text-red-500">*</span>
                </label>
                <input
                  className="input-main text-sm py-1 h-8 w-full"
                  type="text"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Опис товару"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-white text-sm block text-left">
                  Ціна <span className="text-red-500">*</span>
                </label>
                <input
                  className="input-main text-sm py-1 h-8 w-full"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                  placeholder="Ціна"
                  required
                  min={0}
                />
              </div>
              <div>
                <label className="font-semibold text-white text-sm block text-left">
                  Категорія <span className="text-red-500">*</span>
                </label>
                <select
                  className="select-main text-sm py-1 h-10 w-full"
                  value={newProduct.category_id}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      category_id: parseInt(e.target.value),
                    })
                  }
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
                <label className="font-semibold text-white text-sm block text-left">
                  URL зображення <span className="text-red-500">*</span>
                </label>
                <input
                  className="input-main text-sm py-1 h-8 w-full"
                  type="text"
                  value={newProduct.image_url}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image_url: e.target.value })
                  }
                  placeholder="URL зображення"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-white text-sm block text-left">
                  Завантажити зображення
                </label>
                <input
                  className="input-main text-sm py-1 h-8 w-full"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
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
                            ...(token
                              ? { Authorization: `Bearer ${token}` }
                              : {}),
                          },
                        }
                      );
                      setNewProduct((p) => ({ ...p, image_url: res.data.url }));
                    } catch {
                      setError("Не вдалося завантажити зображення");
                    }
                  }}
                />
              </div>
            </div>
          </li>
          <li className=" bg-accent-light rounded-lg p-4 shadow min-h-full md:col-span-2">
            <div className="text-lg font-bold text-header mb-2 text-center">
              Характеристики пристрою{" "}
              <span className="text-xs text-header/70">(додатково)</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="font-semibold text-gray-800 text-sm block text-left">
                  Діагональ екрана (дюйми)
                </label>
                <select
                  className="input-main text-sm py-1 h-8 w-full"
                  value={newProduct.screen_size ?? ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      screen_size: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                >
                  <option value="">Виберіть</option>
                  <option value="13.3">13.3"</option>
                  <option value="14">14"</option>
                  <option value="15.6">15.6"</option>
                  <option value="16">16"</option>
                  <option value="17.3">17.3"</option>
                  <option value="18">18"</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-800 text-sm block text-left">
                  Роздільна здатність
                </label>
                <select
                  className="input-main text-sm py-1 h-8 w-full"
                  value={newProduct.resolution ?? ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, resolution: e.target.value })
                  }
                >
                  <option value="">Виберіть</option>
                  <option value="1920x1080">1920x1080 (FullHD)</option>
                  <option value="2560x1440">2560x1440 (QHD)</option>
                  <option value="2560x1600">2560x1600</option>
                  <option value="2880x1800">2880x1800</option>
                  <option value="3840x2160">3840x2160 (4K UHD)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-800 text-sm block text-left">
                  RAM (ГБ)
                </label>
                <select
                  className="input-main text-sm py-1 h-8 w-full"
                  value={newProduct.ram ?? ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      ram: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                >
                  <option value="">Виберіть</option>
                  <option value="4">4</option>
                  <option value="8">8</option>
                  <option value="12">12</option>
                  <option value="16">16</option>
                  <option value="32">32</option>
                  <option value="64">64</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-800 text-sm block text-left">
                  Накопичувач (ГБ)
                </label>
                <select
                  className="input-main text-sm py-1 h-8 w-full"
                  value={newProduct.storage ?? ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      storage: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                >
                  <option value="">Виберіть</option>
                  <option value="128">128</option>
                  <option value="256">256</option>
                  <option value="512">512</option>
                  <option value="1024">1024 (1 ТБ)</option>
                  <option value="2048">2048 (2 ТБ)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-800 text-sm block text-left">
                  Процесор
                </label>
                <input
                  className="input-main text-sm py-1 h-8 w-full"
                  type="text"
                  value={newProduct.processor ?? ""}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, processor: e.target.value })
                  }
                  placeholder="Процесор"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-800 text-sm block text-left">
                  Батарея (мА·г)
                </label>
                <input
                  className="input-main text-sm py-1 h-8 w-full"
                  type="number"
                  value={newProduct.battery ?? ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      battery: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Батарея"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-800 text-sm block text-left">
                  Частота оновлення (Гц)
                </label>
                <select
                  className="input-main text-sm py-1 h-8 w-full"
                  value={newProduct.refresh_rate ?? ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      refresh_rate: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                >
                  <option value="">Виберіть</option>
                  <option value="60">60</option>
                  <option value="90">90</option>
                  <option value="120">120</option>
                  <option value="144">144</option>
                  <option value="165">165</option>
                  <option value="240">240</option>
                </select>
              </div>
            </div>
          </li>
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
                    {categories.find((c) => c.id === product.category_id)
                      ?.name || product.category_id}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-accent">
                    Діагональ екрана:
                  </span>
                  <span className="ml-2">{product.screen_size ?? "-"}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">
                    Роздільна здатність:
                  </span>
                  <span className="ml-2">{product.resolution ?? "-"}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">RAM:</span>
                  <span className="ml-2">{product.ram ?? "-"}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">
                    Накопичувач:
                  </span>
                  <span className="ml-2">{product.storage ?? "-"}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">Процесор:</span>
                  <span className="ml-2">{product.processor ?? "-"}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">Батарея:</span>
                  <span className="ml-2">{product.battery ?? "-"}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">
                    Частота оновлення:
                  </span>
                  <span className="ml-2">{product.refresh_rate ?? "-"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-accent">Картинка:</span>
                  <a
                    href={product.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-accent break-all underline"
                  >
                    {product.image_url}
                  </a>
                </div>
                <div>
                  <span className="font-semibold text-accent">Створено:</span>
                  <span className="ml-2">
                    {new Date(product.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-accent">Оновлено:</span>
                  <span className="ml-2">
                    {new Date(product.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDeleteProduct(product.id)}
              className="btn-outline mt-4 self-end"
            >
              Видалити
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardProducts;
