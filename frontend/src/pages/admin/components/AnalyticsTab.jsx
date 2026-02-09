import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import SimpleChart from "./SimpleChart";

const AnalyticsTab = ({ orders, users, revenueData }) => (
  <div className="space-y-6">
    {revenueData.length > 0 && (
      <SimpleChart data={revenueData} title="7-Day Revenue Analysis" />
    )}

    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Order Status Distribution
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="space-y-4">
            {[
              {
                label: "Placed",
                value: orders.filter((o) => o.status === "PLACED").length,
                color: "bg-yellow-500",
              },
              {
                label: "Preparing",
                value: orders.filter((o) => o.status === "PREPARING").length,
                color: "bg-blue-500",
              },
              {
                label: "Out for Delivery",
                value: orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length,
                color: "bg-orange-500",
              },
              {
                label: "Delivered",
                value: orders.filter((o) => o.status === "DELIVERED").length,
                color: "bg-green-500",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">
                    {item.label}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {item.value}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all`}
                    style={{
                      width: `${(item.value / Math.max(orders.length, 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "Total Orders",
              value: orders.length,
              icon: ShoppingBag,
              color: "from-blue-50",
            },
            {
              label: "Total Users",
              value: users.length,
              icon: Users,
              color: "from-purple-50",
            },
            {
              label: "Total Revenue",
              value: `₹${orders
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
                .toFixed(0)}`,
              icon: DollarSign,
              color: "from-green-50",
            },
            {
              label: "Avg Order Value",
              value: `₹${(
                orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) /
                Math.max(orders.length, 1)
              ).toFixed(0)}`,
              icon: TrendingUp,
              color: "from-orange-50",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`bg-gradient-to-br ${item.color} to-transparent rounded-2xl p-4`}
            >
              <p className="text-sm text-gray-600 mb-2">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AnalyticsTab;
