import { Plus, Search } from "lucide-react";
import DataTable from "./DataTable";

const FoodsTab = ({
  searchTerm,
  setSearchTerm,
  foodAvailability,
  setFoodAvailability,
  filteredFoods,
  onCreate,
  onEdit,
  onDelete,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search size={20} className="absolute left-4 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search food items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={foodAvailability}
          onChange={(e) => setFoodAvailability(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
        >
          <option value="all">All Availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
        >
          <Plus size={18} />
          Add Food
        </button>
      </div>
    </div>

    <DataTable
      columns={["title", "restaurant", "category", "price", "status"]}
      data={filteredFoods.map((food) => ({
        ...food,
        restaurant: food.restaurantId?.title || "N/A",
        status: food.isAvailable ? "available" : "unavailable",
      }))}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  </div>
);

export default FoodsTab;
