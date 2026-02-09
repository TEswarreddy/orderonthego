import { Search } from "lucide-react";
import DataTable from "./DataTable";

const RestaurantsTab = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filteredRestaurants,
  openModal,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search size={20} className="absolute left-4 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search restaurants..."
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
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
      </select>
    </div>

    <DataTable
      columns={["title", "cuisinetype", "status", "address"]}
      data={filteredRestaurants.map((r) => ({
        ...r,
        cuisinetype: r.cuisineType,
      }))}
      onView={(item) => openModal("restaurant", item)}
      onEdit={(item) => openModal("restaurant", item)}
    />
  </div>
);

export default RestaurantsTab;
