import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between">
      <Link to="/" className="font-bold text-xl">SB Foods</Link>

      <div className="flex gap-4 items-center">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {user?.userType === "USER" && (
          <>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Orders</Link>
          </>
        )}

        {user?.userType === "RESTAURANT" && (
          <Link to="/restaurant">Dashboard</Link>
        )}

        {user?.userType === "ADMIN" && (
          <Link to="/admin">Admin</Link>
        )}

        {user && (
          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;