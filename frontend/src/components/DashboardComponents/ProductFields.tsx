import { Category, NewProduct } from "../../../types/types";
import axios from "axios";
import React from "react";

type Props = {
  newProduct: NewProduct;
  setNewProduct: (p: NewProduct) => void;
  categories: Category[];
  setError: (msg: string) => void;
};

const ProductFields: React.FC<Props> = ({
  newProduct,
  setNewProduct,
  categories,
  setError,
}) => {
  // Знайти вибрану категорію
  const selectedCategory = categories.find(
    (c) => c.id === newProduct.category_id
  );

  // Категорії для прикладу: "Телефони", "Ноутбуки"
  // Можна зробити через id або name, тут через name:
  const isPhone = selectedCategory?.name?.toLowerCase().includes("телефон");
  const isLaptop = selectedCategory?.name?.toLowerCase().includes("ноутбук");

  return (
    <>
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
                  setNewProduct({ ...newProduct, image_url: res.data.url });
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
          {/* Телефони */}
          {isPhone && (
            <>
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
                  <option value="4.7">4.7"</option>
                  <option value="5.0">5.0"</option>
                  <option value="5.5">5.5"</option>
                  <option value="6.1">6.1"</option>
                  <option value="6.5">6.5"</option>
                  <option value="6.7">6.7"</option>
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
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="6">6</option>
                  <option value="8">8</option>
                  <option value="12">12</option>
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
                  <option value="16">16</option>
                  <option value="32">32</option>
                  <option value="64">64</option>
                  <option value="128">128</option>
                  <option value="256">256</option>
                  <option value="512">512</option>
                </select>
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
            </>
          )}
    
          {isLaptop && (
            <>
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
            </>
          )}
      
        </div>
      </li>
    </>
  );
};

export default ProductFields;
