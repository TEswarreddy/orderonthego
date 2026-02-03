import { useEffect, useState } from "react";
import axios from "../../api/axios";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get("/admin/users").then((res) => setUsers(res.data));
    axios.get("/admin/orders").then((res) => setOrders(res.data));
  }, []);

  const approveRestaurant = async (id) => {
    await axios.put(`/admin/approve-restaurant/${id}`);
    setUsers(
      users.map((u) =>
        u._id === id ? { ...u, approval: true } : u
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Users */}
      <h2 className="text-xl font-bold mb-3">Users</h2>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user._id}
            className="border p-3 flex justify-between items-center"
          >
            <div>
              <p>{user.username} ({user.userType})</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            {user.userType === "RESTAURANT" && !user.approval && (
              <button
                onClick={() => approveRestaurant(user._id)}
                className="bg-green-600 text-white px-3 py-1"
              >
                Approve
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Orders */}
      <h2 className="text-xl font-bold mt-8 mb-3">All Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="border p-3 mb-2">
          <p>User ID: {order.userId}</p>
          <p>Status: {order.status}</p>
          <p>Total: ₹{order.totalAmount}</p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
