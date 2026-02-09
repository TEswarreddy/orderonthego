import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Menu, X, ShoppingCart, LogOut } from "lucide-react";
import SubscriptionBadge from "./SubscriptionBadge";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          className="font-bold text-2xl flex items-center gap-2 hover:scale-110 transition-transform duration-300"
        >
          <span className="text-3xl">🍽️</span> Order On The Go
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex gap-8 items-center">
          {!user && (
            <>
              <Link 
                to="/login"
                className="hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                🔐 Login
              </Link>
              <Link 
                to="/register"
                className="hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                📝 Register
              </Link>
            </>
          )}

          {user?.userType === "USER" && (
            <>
              <Link 
                to="/cart"
                className="flex items-center gap-2 hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                <ShoppingCart size={20} /> Cart
              </Link>
              <Link 
                to="/orders"
                className="hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                📦 Orders
              </Link>
            </>
          )}

          {user?.userType === "RESTAURANT" && (
            <>
              <Link 
                to="/restaurant"
                className="hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                🏪 Dashboard
              </Link>
              <SubscriptionBadge />
            </>
          )}

          {user?.userType === "STAFF" && (
            <Link 
              to="/restaurant"
              className="hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              🏪 Dashboard
            </Link>
          )}

          {user?.userType === "ADMIN" && (
            <Link 
              to="/admin"
              className="hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              ⚙️ Admin
            </Link>
          )}

          {user && (
            <div className="flex items-center gap-3">
              <Link
                to={
                  user.userType === "USER"
                    ? "/profile"
                    : user.userType === "RESTAURANT"
                    ? "/restaurant/profile"
                    : user.userType === "STAFF"
                    ? "/staff/profile"
                    : user.userType === "ADMIN"
                    ? "/admin/profile"
                    : "/profile"
                }
                className="text-sm text-yellow-200 hover:text-white transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              >
                👤 {user.username || user.name || "Profile"}
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden mt-4 pb-4 border-t border-white border-opacity-20 pt-4 space-y-3">
          {!user && (
            <>
              <Link 
                to="/login"
                className="block hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                onClick={() => setIsOpen(false)}
              >
                🔐 Login
              </Link>
              <Link 
                to="/register"
                className="block hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                onClick={() => setIsOpen(false)}
              >
                📝 Register
              </Link>
            </>
          )}

          {user?.userType === "USER" && (
            <>
              <Link 
                to="/cart"
                className="flex items-center gap-2 hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart size={20} /> Cart
              </Link>
              <Link 
                to="/orders"
                className="block hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                onClick={() => setIsOpen(false)}
              >
                📦 Orders
              </Link>
            </>
          )}

          {user?.userType === "RESTAURANT" && (
            <>
              <Link 
                to="/restaurant"
                className="block hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                onClick={() => setIsOpen(false)}
              >
                🏪 Dashboard
              </Link>
              <div className="px-3 py-2">
                <SubscriptionBadge />
              </div>
            </>
          )}

          {user?.userType === "STAFF" && (
            <Link 
              to="/restaurant"
              className="block hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              onClick={() => setIsOpen(false)}
            >
              🏪 Dashboard
            </Link>
          )}

          {user?.userType === "ADMIN" && (
            <Link 
              to="/admin"
              className="block hover:text-yellow-200 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10"
              onClick={() => setIsOpen(false)}
            >
              ⚙️ Admin
            </Link>
          )}

          {user && (
            <div className="flex flex-col gap-2">
              <Link
                to={
                  user.userType === "USER"
                    ? "/profile"
                    : user.userType === "RESTAURANT"
                    ? "/restaurant/profile"
                    : user.userType === "STAFF"
                    ? "/staff/profile"
                    : user.userType === "ADMIN"
                    ? "/admin/profile"
                    : "/profile"
                }
                className="text-sm text-yellow-200 hover:text-white transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10 text-left"
                onClick={() => setIsOpen(false)}
              >
                👤 {user.username || user.name || "Profile"}
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-all duration-200 font-semibold w-full justify-center"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;