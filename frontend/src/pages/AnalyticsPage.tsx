import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import dayjs from "dayjs";

type AnalyticsData = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  newCustomers: number;
  orderDistribution: { status: string; count: number }[];
  revenueByDay: { day: string; revenue: number; orders: number }[];
  popularProducts: { product_id: number; name: string; total_sold: number }[];
};

type Category = { id: number; name: string };

const COLORS = ["#FE7743", "#609966", "#40513B", "#9DC08B", "#EDF1D6", "#FFB347", "#FF6961"];

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    category: "",
    status: "",
  });

useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await axios.get<Category[]>("/api/categories", {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
            });
            setCategories(res.data);
        } catch (error) {
            setCategories([]);
        }
    };
    fetchCategories();
}, []);

useEffect(() => {
    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await axios.get<AnalyticsData>("/api/analytics", {
                params: filters,
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
            });
            setData(res.data);
        } catch (error) {
            setData(null);
        } finally {
            setLoading(false);
        }
    };
    fetchAnalytics();
}, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  return (
    <div className="p-6 bg-main min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-dark">Аналітика магазину</h1>
      {/* Фільтри */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-dark font-semibold mb-1">Початкова дата</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="input-main"
          />
        </div>
        <div>
          <label className="block text-dark font-semibold mb-1">Кінцева дата</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="input-main"
          />
        </div>
        <div className="pb-4">
          <label className="block text-dark font-semibold mb-1">Категорія</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="select-main pb-2"
          >
            <option value="">Всі</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="pb-4">
          <label className="block text-dark font-semibold mb-1">Статус</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="select-main"
          >
            <option value="">Всі</option>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="paid">paid</option>
            <option value="shipped">shipped</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      </div>
      {/* Метрики */}
      {loading ? (
        <div>Завантаження...</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <span className="text-dark font-semibold">Замовлень</span>
              <span className="text-3xl font-bold text-accent">{data.totalOrders}</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <span className="text-dark font-semibold">Виручка</span>
              <span className="text-3xl font-bold text-accent">{data.totalRevenue} ₴</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <span className="text-dark font-semibold">Середній чек</span>
              <span className="text-3xl font-bold text-accent">{data.averageOrderValue.toFixed(2)} ₴</span>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <span className="text-dark font-semibold">Нових клієнтів</span>
              <span className="text-3xl font-bold text-accent">{data.newCustomers}</span>
            </div>
          </div>
          {/* Графіки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Виручка по днях */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold mb-4 text-dark">Виручка по днях</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.revenueByDay}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <XAxis
                    dataKey="day"
                    tickFormatter={d => dayjs(d).format("DD.MM")}
                  />
                  <YAxis
                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                  />
                  <Tooltip
                    labelFormatter={d => `Дата: ${dayjs(d).format("DD.MM.YYYY")}`}
                    formatter={(value: any) => [`${value} ₴`, "Виручка"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#FE7743" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Розподіл замовлень за статусами */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold mb-4 text-dark">Замовлення за статусами</h2>
              <ResponsiveContainer width="100%" height={250}>
                {data.orderDistribution && data.orderDistribution.length > 0 && data.orderDistribution.some(d => Number(d.count) > 0) ? (
                  <PieChart>
                    <Pie
                      data={data.orderDistribution.map(d => ({ ...d, count: Number(d.count) }))}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {data.orderDistribution.map((entry, idx) => (
                        <Cell key={entry.status} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                ) : (
                  <div className="text-center text-gray-400 pt-16">Немає даних для діаграми</div>
                )}
              </ResponsiveContainer>
            </div>
            {/* Популярні товари */}
            <div className="bg-white rounded-xl shadow p-6 col-span-1 md:col-span-2">
              <h2 className="text-lg font-bold mb-4 text-dark">Топ-10 популярних товарів</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.popularProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_sold" fill="#609966" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div>Даних не знайдено</div>
      )}
    </div>
  );
};

export default AnalyticsPage;
