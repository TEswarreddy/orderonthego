import { Search } from "lucide-react";
import DataTable from "./DataTable";

const UsersTab = ({
  searchTerm,
  setSearchTerm,
  filteredUsers,
  openModal,
  handleDeleteUser,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="mb-6 relative">
      <Search size={20} className="absolute left-4 top-3 text-gray-400" />
      <input
        type="text"
        placeholder="Search users by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-12 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none transition"
      />
    </div>

    <DataTable
      columns={["username", "email", "status", "phone"]}
      data={filteredUsers}
      onEdit={(item) => openModal("user", item)}
      onDelete={(item) => handleDeleteUser(item._id)}
    />
  </div>
);

export default UsersTab;
