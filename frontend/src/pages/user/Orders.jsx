import { useEffect, useState } from "react";
import axios from "../../api/axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get("/orders/my-orders").then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="border p-3 mb-3">
          <p>Status: {order.status}</p>
          <p>Total: ₹{order.totalAmount}</p>
        </div>
      ))}
    </div>
  );
};

export default Orders;
