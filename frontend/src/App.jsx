import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import UserLogin from "./pages/auth/UserLogin";
import RestaurantLogin from "./pages/auth/RestaurantLogin";
import AdminLogin from "./pages/auth/AdminLogin";
import Register from "./pages/auth/Register";
import UserRegister from "./pages/auth/UserRegister";
import RestaurantRegister from "./pages/auth/RestaurantRegister";
import Home from "./pages/user/Home";
import FoodDetail from "./pages/user/FoodDetail";
import Cart from "./pages/user/Cart";
import Orders from "./pages/user/Orders";
import Payment from "./pages/user/Payment";
import UserProfile from "./pages/user/Profile";
import RestaurantProfile from "./pages/restaurant/Profile";
import StaffProfile from "./pages/staff/Profile";
import AdminProfile from "./pages/admin/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import RestaurantDashboard from "./pages/restaurant/Dashboard";
import SubscriptionPlans from "./pages/restaurant/SubscriptionPlans";
import About from "./pages/info/About";
import HelpCenter from "./pages/info/HelpCenter";
import TermsOfService from "./pages/info/TermsOfService";
import PrivacyPolicy from "./pages/info/PrivacyPolicy";
import Faqs from "./pages/info/Faqs";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StaffInvite from "./pages/auth/StaffInvite";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/food/:foodId" element={<FoodDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/user" element={<UserLogin />} />
          <Route path="/login/restaurant" element={<RestaurantLogin />} />
          <Route path="/admin-access" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/user" element={<UserRegister />} />
          <Route path="/register/restaurant" element={<RestaurantRegister />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/faqs" element={<Faqs />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute role="USER">
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute role="USER">
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute role="USER">
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <ProtectedRoute role="USER">
                <Payment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/restaurant"
            element={
              <ProtectedRoute role={["RESTAURANT", "STAFF"]}>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/restaurant/profile"
            element={
              <ProtectedRoute role="RESTAURANT">
                <RestaurantProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/profile"
            element={
              <ProtectedRoute role="STAFF">
                <StaffProfile />
              </ProtectedRoute>
            }
          />

          <Route path="/subscriptions" element={<SubscriptionPlans />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          <Route path="/staff-invite/:token" element={<StaffInvite />} />
        </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
