import { Search } from "lucide-react";
import DataTable from "./DataTable";

const OrdersTab = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filteredOrders,
  openModal,
  handleDeleteOrder,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search size={20} className="absolute left-4 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
        />
      </div>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
      >
        <option value="all">All Status</option>
        <option value="PLACED">Placed</option>
        <option value="PREPARING">Preparing</option>
        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>

    <DataTable
      columns={["orderid", "date", "amount", "status"]}
      data={filteredOrders.map((o) => ({
        ...o,
        orderid: `#${o._id?.slice(-6)}`,
        date: new Date(o.createdAt).toLocaleDateString(),
        amount: o.totalAmount,
      }))}
      onEdit={(item) => openModal("order", item)}
      onDelete={(item) => handleDeleteOrder(item._id)}
    />
  </div>
);

export default OrdersTab;
