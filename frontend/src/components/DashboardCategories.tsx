import { useEffect, useState } from "react";
import axios from "axios";
import {Category, NewCategory } from "../../types/types";


const DashboardCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<NewCategory>({ name: "" });
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
  
    axios.get<Category[]>("/api/categories", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      setCategories(response.data);
    })
    .catch(error => {
      setError("Не вдалося отримати категорії.");
    });
  }, []);
  

  const handleAddCategory = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;
  
      const response = await axios.post<Category>(
        "/api/categories",newCategory,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setCategories([...categories, response.data]);
      setNewCategory({ name: "" });
    } catch (error) {
      setError("Не вдалося додати категорію.");
    }
  };
  

  const handleDeleteCategory = async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      await axios.delete(`/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCategories(categories.filter(category => category.id !== id));
    } catch (error) {
      setError("Не вдалося видалити категорію.");
      
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center text-accent drop-shadow">Управління категоріями</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="bg-dark rounded-xl shadow-lg p-6 mb-8 max-w-md mx-auto flex flex-col gap-3">
        <input 
          className="input-main"
          type="text" 
          value={newCategory.name} 
          onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
          placeholder="Нова категорія" 
        />
        <button onClick={handleAddCategory} className="btn-main self-end">
          Додати категорію
        </button>
      </div>
      <ul>
        {categories.map(category => (
          <li
            key={category.id}
            className="bg-dark text-white p-2 rounded mb-2 shadow border border-accent/30 hover:shadow-2xl transition-shadow duration-200 flex items-center justify-between"
          >
            <span>{category.name}</span>
            <button onClick={() => handleDeleteCategory(category.id)} className="btn-outline ml-2">
              Видалити
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardCategories;
