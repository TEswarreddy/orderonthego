import { BarChart3, CheckCircle, Clock, Download, Store, TrendingUp, Users, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "../../../api/axios";
import DataTable from "./DataTable";
import SimpleChart from "./SimpleChart";

const OverviewTab = ({
  stats,
  orders,
  revenueData,
  restaurants,
  setActiveTab,
  openModal,
}) => {
  const [revenueStats, setRevenueStats] = useState({});

  useEffect(() => {
    fetchRevenueStats();
  }, []);

  const fetchRevenueStats = async () => {
    try {
      const res = await axios.get("/admin/analytics/revenue/stats");
      setRevenueStats(res.data);
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Food Revenue</p>
              <p className="text-3xl font-bold text-orange-600">
                ₹{(revenueStats.foodRevenue || 0).toLocaleString()}
              </p>
            </div>
            <DollarSign size={32} className="text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Subscription Revenue</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{(revenueStats.subscriptionRevenue || 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp size={32} className="text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{(revenueStats.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <DollarSign size={32} className="text-green-600" />
          </div>
        </div>
      </div>

      {revenueData.length > 0 && (
        <SimpleChart data={revenueData} title="7-Day Revenue Trend" />
      )}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        {
          icon: TrendingUp,
          label: "Conversion Rate",
          value: `${(
            ((stats.totalOrders || 0) / Math.max(stats.totalUsers || 1, 1)) *
            100
          ).toFixed(1)}%`,
          color: "from-blue-50 to-blue-100",
          textColor: "text-blue-600",
        },
        {
          icon: Users,
          label: "Avg Order Value",
          value: `₹${(stats.avgOrderValue || 0).toFixed(0)}`,
          color: "from-purple-50 to-purple-100",
          textColor: "text-purple-600",
        },
        {
          icon: Clock,
          label: "Pending Orders",
          value: stats.pendingOrders || 0,
          color: "from-orange-50 to-orange-100",
          textColor: "text-orange-600",
        },
        {
          icon: CheckCircle,
          label: "Delivered Today",
          value: stats.deliveredToday || 0,
          color: "from-green-50 to-green-100",
          textColor: "text-green-600",
        },
      ].map((metric, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${metric.color} rounded-2xl shadow-lg p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
              <p className={`text-3xl font-bold ${metric.textColor}`}>
                {metric.value}
              </p>
            </div>
            <metric.icon size={32} className={metric.textColor} />
          </div>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg font-semibold hover:bg-orange-200 transition">
          <Download size={18} />
          Export
        </button>
      </div>
      <DataTable
        columns={["orderid", "date", "amount", "status"]}
        data={orders.slice(0, 5).map((o) => ({
          ...o,
          orderid: `#${o._id?.slice(-6)}`,
          date: new Date(o.createdAt).toLocaleDateString(),
          amount: o.totalAmount,
        }))}
        onView={(item) => openModal("order", item)}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        {
          icon: Download,
          title: "Generate Reports",
          color: "from-blue-500 to-blue-600",
          target: "analytics",
        },
        {
          icon: Users,
          title: "Manage Users",
          color: "from-purple-500 to-purple-600",
          target: "users",
        },
        {
          icon: Store,
          title: "Restaurants",
          color: "from-indigo-500 to-indigo-600",
          target: "restaurants",
        },
        {
          icon: BarChart3,
          title: "View Analytics",
          color: "from-orange-500 to-orange-600",
          target: "analytics",
        },
        {
          icon: DollarSign,
          title: "View Revenue",
          color: "from-green-500 to-green-600",
          target: "revenue",
        },
      ].map((action, idx) => (
        <button
          key={idx}
          onClick={() => setActiveTab(action.target)}
          className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-2xl cursor-pointer transition transform hover:-translate-y-1 hover:shadow-lg flex flex-col items-center gap-3`}
        >
          <action.icon size={28} />
          <p className="font-semibold text-center">{action.title}</p>
        </button>
      ))}
    </div>
  </div>
  );
};

export default OverviewTab;
