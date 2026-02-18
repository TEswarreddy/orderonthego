import { Clock } from "lucide-react";

const OrdersTab = ({
  user,
  orders,
  orderSearch,
  setOrderSearch,
  orderFilter,
  setOrderFilter,
  handleOrderStatusChange,
  getAllowedStatusOptions,
  getDisplayStatusOptions,
}) => (
  <div className="space-y-4">
    {/* Search and Filter */}
    <div className="bg-white rounded-lg shadow p-4 flex gap-4 flex-wrap items-center">
      <input
        type="text"
        placeholder="🔍 Search by Order ID..."
        value={orderSearch}
        onChange={(e) => setOrderSearch(e.target.value)}
        className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
      <select
        value={orderFilter}
        onChange={(e) => setOrderFilter(e.target.value)}
        className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="preparing">Preparing</option>
        <option value="ready">Ready</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      {(orderSearch || orderFilter !== "all") && (
        <button
          onClick={() => {
            setOrderSearch("");
            setOrderFilter("all");
          }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-semibold"
        >
          ✕ Clear
        </button>
      )}
    </div>

    {/* Orders Table */}
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">No active orders</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Order ID</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Items</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Current Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter((order) => {
                  const matchesSearch = order._id.includes(orderSearch);
                  const matchesFilter =
                    orderFilter === "all" || order.status?.toLowerCase() === orderFilter.toLowerCase();
                  return matchesSearch && matchesFilter;
                })
                .map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-4 px-6 font-mono text-gray-700 font-semibold">#{order._id?.slice(-6) || "N/A"}</td>
                    <td className="py-4 px-6 text-gray-700">{order.items?.length || 0} items</td>
                    <td className="py-4 px-6 font-semibold text-gray-900">₹{(order.totalAmount || 0).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status?.toLowerCase() === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status?.toLowerCase() === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : order.status?.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status?.toLowerCase() === "preparing"
                            ? "bg-purple-100 text-purple-800"
                            : order.status?.toLowerCase() === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user?.userType === "STAFF" && getAllowedStatusOptions().length === 0 ? (
                        <span className="text-sm text-gray-500">View only</span>
                      ) : (
                        <select
                          value={(order.status || "PLACED").toString().toUpperCase()}
                          onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                          className="bg-white text-gray-900 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-semibold"
                        >
                          {getDisplayStatusOptions((order.status || "PLACED").toString().toUpperCase()).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

export default OrdersTab;
