import { useState } from "react";
import axios from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import VerificationModal from "../../components/VerificationModal";

const RestaurantRegister = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    restaurantName: "",
    restaurantAddress: "",
    cuisineType: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredPhone, setRegisteredPhone] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/auth/register", {
        ...form,
        userType: "RESTAURANT",
      });
      
      setRegisteredEmail(form.email);
      setRegisteredPhone(form.phone);
      setShowVerification(true);
      alert(response.data.message || "Registration successful! Please verify your email. Your account is pending admin approval.");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    setShowVerification(false);
    navigate("/login/restaurant");
  };

  const handleSkipVerification = () => {
    setShowVerification(false);
    navigate("/login/restaurant");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Restaurant Registration</h2>
            <p className="mt-2 text-sm text-gray-600">
              Register your restaurant to start receiving orders
            </p>
            <p className="mt-1 text-xs text-orange-600 font-medium">
              ⏳ Your account will be reviewed by admin before activation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Owner Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                  Owner Information
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Full Name *
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="restaurant@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Restaurant Information */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                  Restaurant Information
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name *
                </label>
                <input
                  name="restaurantName"
                  type="text"
                  required
                  placeholder="The Great Eatery"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={form.restaurantName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine Type *
                </label>
                <input
                  name="cuisineType"
                  type="text"
                  required
                  placeholder="Italian, Chinese, American, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={form.cuisineType}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Address *
                </label>
                <textarea
                  name="restaurantAddress"
                  rows="2"
                  required
                  placeholder="Complete street address with city, state, and ZIP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  value={form.restaurantAddress}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Tell customers about your restaurant, specialties, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Submitting Registration..." : "Register Restaurant"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Want to register as a customer?{" "}
              <Link to="/register/user" className="text-blue-500 hover:text-blue-600 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <VerificationModal
          email={registeredEmail}
          phone={registeredPhone}
          onVerificationComplete={handleVerificationComplete}
          onSkip={handleSkipVerification}
        />
      )}
    </div>
  );
};

export default RestaurantRegister;
