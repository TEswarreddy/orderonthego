import { useState, useEffect } from "react";
import axios from "../../../api/axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

const RevenueTab = () => {
  const [foodRevenueChart, setFoodRevenueChart] = useState([]);
  const [subscriptionRevenueChart, setSubscriptionRevenueChart] = useState([]);
  const [revenueByRestaurant, setRevenueByRestaurant] = useState([]);
  const [revenueStats, setRevenueStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState("combined");

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const [foodRes, subRes, byRestRes, statsRes] = await Promise.all([
        axios.get("/admin/analytics/revenue/food"),
        axios.get("/admin/analytics/revenue/subscriptions"),
        axios.get("/admin/analytics/revenue/by-restaurant"),
        axios.get("/admin/analytics/revenue/stats"),
      ]);

      setFoodRevenueChart(foodRes.data);
      setSubscriptionRevenueChart(subRes.data);
      setRevenueByRestaurant(byRestRes.data);
      setRevenueStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Combine food and subscription data for comparison chart
  const combinedChartData = foodRevenueChart.map((item, index) => ({
    date: item.date,
    food: item.revenue,
    subscription: subscriptionRevenueChart[index]?.revenue || 0,
  }));

  const COLORS = ["#F97316", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Food Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                ₹{revenueStats.foodRevenue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <DollarSign className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Subscription Revenue
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                ₹{revenueStats.subscriptionRevenue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="text-blue-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                ₹{revenueStats.totalRevenue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Selection Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveChart("combined")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeChart === "combined"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Combined Trend
        </button>
        <button
          onClick={() => setActiveChart("byRestaurant")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeChart === "byRestaurant"
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          By Restaurant
        </button>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeChart === "combined" && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Revenue Trend (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="food"
                  stroke="#F97316"
                  strokeWidth={2}
                  name="Food Revenue"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="subscription"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Subscription Revenue"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === "byRestaurant" && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Revenue Breakdown by Restaurant
            </h3>
            {revenueByRestaurant.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueByRestaurant}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="restaurantName"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Bar
                      dataKey="foodRevenue"
                      fill="#F97316"
                      name="Food Revenue"
                    />
                    <Bar
                      dataKey="subscriptionRevenue"
                      fill="#3B82F6"
                      name="Subscription Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* Restaurant Revenue Table */}
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b border-gray-300">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700">
                          Restaurant
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-700">
                          Food Revenue
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-700">
                          Orders
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-700">
                          Subscription Revenue
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-700">
                          Subscriptions
                        </th>
                        <th className="px-4 py-3 font-semibold text-gray-700">
                          Total Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueByRestaurant.map((restaurant, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {restaurant.restaurantName}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            ₹{restaurant.foodRevenue?.toLocaleString() || 0}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {restaurant.orderCount || 0}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            ₹{restaurant.subscriptionRevenue?.toLocaleString() || 0}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {restaurant.subscriptionCount || 0}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-800">
                            ₹{restaurant.totalRevenue?.toLocaleString() || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No revenue data available
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueTab;
