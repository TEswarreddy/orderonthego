import { useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { Clock, MapPin, Package, ChevronDown, CheckCircle, AlertCircle, Truck } from "lucide-react";

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/orders/my-orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const isCancellable = (status) => ["placed", "pending", "confirmed"].includes(status?.toLowerCase());

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order? This action cannot be undone.")) return;
    try {
      setCancelError("");
      setCancellingOrderId(orderId);
      const res = await axios.put(`/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((order) => (order._id === orderId ? res.data : order)));
    } catch (err) {
      const message = err.response?.data?.message || "Failed to cancel order";
      setCancelError(message);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      preparing: "bg-purple-100 text-purple-800 border-purple-300",
      ready: "bg-green-100 text-green-800 border-green-300",
      delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock size={18} />,
      confirmed: <CheckCircle size={18} />,
      preparing: <Package size={18} />,
      ready: <Truck size={18} />,
      delivered: <CheckCircle size={18} />,
      cancelled: <AlertCircle size={18} />,
    };
    return icons[status?.toLowerCase()] || <AlertCircle size={18} />;
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    return order.status?.toLowerCase() === filterStatus.toLowerCase();
  });

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading your orders...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

        {cancelError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {cancelError}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "pending", "confirmed", "preparing", "ready", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                filterStatus === status
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-orange-500"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No {filterStatus !== "all" ? filterStatus : ""} orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition">
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-6 flex-1 text-left">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-gray-800">Order #{order._id?.slice(-6) || "N/A"}</span>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-semibold text-sm ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || "Pending"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt || new Date()).toLocaleDateString()}, Estimated: {new Date(Date.now() + 45 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{(order.totalAmount || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <ChevronDown
                    size={24}
                    className={`text-gray-400 transition ${expandedOrder === order._id ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Order Details - Expandable */}
                {expandedOrder === order._id && (
                  <div className="border-t p-6 bg-gray-50 space-y-6">
                    {/* Items */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Items</h3>
                      <div className="space-y-2">
                        {(order.items || []).length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between py-2 border-b">
                              <div>
                                <p className="font-medium text-gray-700">{item.title || item.itemName}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No items in order</p>
                        )}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between mb-2 text-gray-700">
                        <span>Subtotal</span>
                        <span>₹{((order.totalAmount || 0) * 0.95).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Tax (5%)</span>
                        <span>₹{((order.totalAmount || 0) * 0.05).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg text-gray-900 mt-3 pt-3 border-t">
                        <span>Total</span>
                        <span>₹{(order.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4">Order Timeline</h3>
                      <div className="space-y-3">
                        {order.status?.toLowerCase() === "cancelled" ? (
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="font-semibold text-red-700">Cancelled</span>
                            <AlertCircle size={18} className="text-red-500 ml-auto" />
                          </div>
                        ) : (
                          ["Order Placed", "Pending", "Confirmed", "Preparing", "Ready for Delivery", "Delivered"].map((step, idx) => {
                            const statusMapping = ["placed", "pending", "confirmed", "preparing", "ready", "delivered"];
                            const currentStatusIndex = statusMapping.indexOf(order.status?.toLowerCase());
                            const isCompleted = idx <= currentStatusIndex && currentStatusIndex !== -1;

                            return (
                              <div key={idx} className="flex items-center gap-4">
                                <div
                                  className={`w-3 h-3 rounded-full ${isCompleted ? "bg-green-500" : "bg-gray-300"}`}
                                ></div>
                                <span className={isCompleted ? "font-semibold text-gray-800" : "text-gray-500"}>
                                  {step}
                                </span>
                                {isCompleted && <CheckCircle size={18} className="text-green-500 ml-auto" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {isCancellable(order.status) && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrderId === order._id}
                          className="px-4 py-2 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-60"
                        >
                          {cancellingOrderId === order._id ? "Cancelling..." : "Cancel Order"}
                        </button>
                      </div>
                    )}

                    {/* Delivery Address */}
                    <div className="bg-white p-4 rounded-lg border flex gap-3">
                      <MapPin size={20} className="text-orange-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">Delivery Address</p>
                        <p className="text-sm text-gray-600">{order.address || "Address not provided"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
