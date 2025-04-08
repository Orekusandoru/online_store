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
      <h1>Управління категоріями</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input 
        type="text" 
        value={newCategory.name} 
        onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
        placeholder="Нова категорія" 
      />
      <button onClick={handleAddCategory}>Додати категорію</button>
      <ul>
        {categories.map(category => (
          <li key={category.id}>
            {category.name} 
            <button onClick={() => handleDeleteCategory(category.id)}>Видалити</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardCategories;
