import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const SettingsTab = ({ user, stats, restaurantProfile }) => (
  <div className="space-y-6">
    {/* Restaurant Profile */}
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>🏪</span> Restaurant Profile
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Restaurant Name</label>
          <input
            type="text"
            value={restaurantProfile?.restaurant?.title || user?.username || ""}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Account Type</label>
          <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
            <span className="text-gray-700 font-semibold px-3 py-1 bg-orange-100 text-orange-700 rounded inline-block">
              🍽️ Restaurant Owner
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Member Since</label>
          <input
            type="text"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ℹ️ <strong>Contact Support</strong> to update your restaurant details. <Link to="/help" className="underline font-semibold">Get help here</Link>
        </p>
      </div>
    </div>

    {/* Business Statistics */}
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp size={28} className="text-orange-600" /> Business Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Total Menu Items</p>
          <p className="text-4xl font-bold text-blue-600">{stats.totalItems}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Active Orders Today</p>
          <p className="text-4xl font-bold text-orange-600">{stats.activeOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
          <p className="text-4xl font-bold text-emerald-600">₹{Math.round(stats.totalRevenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Average Rating</p>
          <p className="text-4xl font-bold text-yellow-600">{stats.averageRating} ⭐</p>
        </div>
      </div>
    </div>

    {/* Security & Preferences */}
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🔒 Security & Preferences</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="font-semibold text-gray-900">Change Password</p>
            <p className="text-sm text-gray-600">Update your account password regularly</p>
          </div>
          <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-semibold">
            Change
          </button>
        </div>

        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
            <p className="text-sm text-gray-600">Add extra security to your account</p>
          </div>
          <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-semibold">
            Enable
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-600">Get updates about orders and account activity</p>
          </div>
          <button className="px-6 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition font-semibold">
            ✓ Enabled
          </button>
        </div>
      </div>
    </div>

    {/* Logout Section */}
    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
      <h2 className="text-2xl font-bold text-red-900 mb-2">Danger Zone</h2>
      <p className="text-red-700 mb-4">
        Once you log out, you will need to log in again to access your restaurant dashboard.
      </p>
      <button className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition">
        🚪 Logout
      </button>
    </div>
  </div>
);

export default SettingsTab;
