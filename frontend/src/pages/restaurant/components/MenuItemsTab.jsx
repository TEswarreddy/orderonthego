import { Plus, Edit2, Trash2 } from "lucide-react";

const MenuItemsTab = ({
  user,
  foods,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  showAddForm,
  setShowAddForm,
  showEditForm,
  setShowEditForm,
  editingFood,
  setEditingFood,
  newFood,
  setNewFood,
  handleAddFood,
  handleUpdateFood,
  handleEditFood,
  handleDeleteFood,
  handleAvailabilityToggle,
}) => (
  <div className="space-y-6">
    {/* Add Food Form */}
    {user?.userType === "RESTAURANT" && !showAddForm && !showEditForm ? (
      <button
        onClick={() => setShowAddForm(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold"
      >
        <Plus size={20} /> Add New Food Item
      </button>
    ) : null}

    {user?.userType === "RESTAURANT" && showAddForm && !showEditForm && (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Food Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Food Name *"
            value={newFood.title}
            onChange={(e) => setNewFood({ ...newFood, title: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Price (₹) *"
            value={newFood.price}
            onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select
            value={newFood.category}
            onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
            className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="biryani">Biryani</option>
            <option value="curry">Curry</option>
            <option value="tandoori">Tandoori</option>
            <option value="dosa">Dosa</option>
            <option value="samosa">Samosa</option>
            <option value="paneer">Paneer Dishes</option>
            <option value="dal">Dal</option>
            <option value="naan">Naan/Roti</option>
            <option value="paratha">Paratha</option>
            <option value="chaat">Chaat</option>
            <option value="indian-sweets">Indian Sweets</option>
            <option value="thali">Thali</option>
            <option value="rice">Rice Dishes</option>
            <option value="pizza">Pizza</option>
            <option value="sushi">Sushi</option>
            <option value="burger">Burger</option>
            <option value="dessert">Dessert</option>
            <option value="beverage">Beverage</option>
          </select>
          <select
            value={newFood.isVeg === false ? "nonveg" : "veg"}
            onChange={(e) => setNewFood({ ...newFood, isVeg: e.target.value === "veg" })}
            className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="veg">Veg</option>
            <option value="nonveg">Non-Veg</option>
          </select>
        </div>

        <textarea
          placeholder="Description"
          value={newFood.description}
          onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none mb-4"
          rows={3}
        />

        <div className="flex gap-3">
          <button
            onClick={handleAddFood}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            Add Item
          </button>
          <button
            onClick={() => setShowAddForm(false)}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    {user?.userType === "RESTAURANT" && showEditForm && editingFood && (
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">✏️ Edit Food Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Food Name *"
            value={newFood.title}
            onChange={(e) => setNewFood({ ...newFood, title: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Price (₹) *"
            value={newFood.price}
            onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select
            value={newFood.category}
            onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
            className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="biryani">Biryani</option>
            <option value="curry">Curry</option>
            <option value="tandoori">Tandoori</option>
            <option value="dosa">Dosa</option>
            <option value="samosa">Samosa</option>
            <option value="paneer">Paneer Dishes</option>
            <option value="dal">Dal</option>
            <option value="naan">Naan/Roti</option>
            <option value="paratha">Paratha</option>
            <option value="chaat">Chaat</option>
            <option value="indian-sweets">Indian Sweets</option>
            <option value="thali">Thali</option>
            <option value="rice">Rice Dishes</option>
            <option value="pizza">Pizza</option>
            <option value="sushi">Sushi</option>
            <option value="burger">Burger</option>
            <option value="dessert">Dessert</option>
            <option value="beverage">Beverage</option>
          </select>
          <select
            value={newFood.isVeg === false ? "nonveg" : "veg"}
            onChange={(e) => setNewFood({ ...newFood, isVeg: e.target.value === "veg" })}
            className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="veg">Veg</option>
            <option value="nonveg">Non-Veg</option>
          </select>
        </div>

        <textarea
          placeholder="Description"
          value={newFood.description}
          onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none mb-4"
          rows={3}
        />

        <div className="flex gap-3">
          <button
            onClick={handleUpdateFood}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            Save Changes
          </button>
          <button
            onClick={() => {
              setShowEditForm(false);
              setEditingFood(null);
              setNewFood({ title: "", price: "", description: "", category: "biryani", isVeg: true });
            }}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    {/* Search and Filter */}
    {!showAddForm && !showEditForm && (
      <div className="bg-white rounded-lg shadow p-4 flex gap-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="🔍 Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="biryani">Biryani</option>
          <option value="curry">Curry</option>
          <option value="tandoori">Tandoori</option>
          <option value="dosa">Dosa</option>
          <option value="samosa">Samosa</option>
          <option value="paneer">Paneer Dishes</option>
          <option value="dal">Dal</option>
          <option value="naan">Naan/Roti</option>
          <option value="paratha">Paratha</option>
          <option value="chaat">Chaat</option>
          <option value="indian-sweets">Indian Sweets</option>
          <option value="thali">Thali</option>
          <option value="rice">Rice Dishes</option>
          <option value="pizza">Pizza</option>
          <option value="sushi">Sushi</option>
          <option value="burger">Burger</option>
          <option value="dessert">Dessert</option>
          <option value="beverage">Beverage</option>
        </select>
        {(searchQuery || filterCategory !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterCategory("all");
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-semibold"
          >
            ✕ Clear
          </button>
        )}
      </div>
    )}

    {/* Food Items Grid */}
    {!showAddForm && !showEditForm && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods
          .filter((food) => {
            const matchesSearch = food.title.toLowerCase().includes(searchQuery);
            const matchesCategory = filterCategory === "all" || food.category === filterCategory;
            return matchesSearch && matchesCategory;
          })
          .map((food) => (
            <div key={food._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="w-full h-40 bg-gradient-to-br from-orange-200 to-red-200"></div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{food.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{food.description || "No description"}</p>

                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-2xl font-bold text-orange-600">₹{food.price?.toFixed(2) || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold text-gray-800 capitalize">{food.category || "Food"}</p>
                    {typeof food.isVeg === "boolean" && (
                      <p className={`mt-1 text-xs font-semibold ${food.isVeg ? "text-green-700" : "text-red-700"}`}>
                        {food.isVeg ? "Veg" : "Non-Veg"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-lg font-bold text-yellow-500">{food.rating ? `${food.rating} ⭐` : "No ratings"}</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">Availability</p>
                  <button
                    onClick={() => handleAvailabilityToggle(food._id, !(food.isAvailable !== false))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      food.isAvailable !== false
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {food.isAvailable !== false ? "Available" : "Unavailable"}
                  </button>
                </div>

                {user?.userType === "RESTAURANT" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditFood(food)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg transition font-semibold"
                    >
                      <Edit2 size={18} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFood(food._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg transition font-semibold"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    )}
  </div>
);

export default MenuItemsTab;
