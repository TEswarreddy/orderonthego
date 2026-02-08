import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Crown, AlertCircle, TrendingUp } from "lucide-react";

const SubscriptionBadge = () => {
  const { user } = useContext(AuthContext);
  const [subscription, setSubscription] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (user && user.userType === "RESTAURANT") {
      const fetchSubscription = async () => {
        try {
          const res = await axios.get("/subscriptions/usage");
          setSubscription(res.data);
        } catch (err) {
          console.error("Failed to fetch subscription:", err);
        }
      };
      fetchSubscription();
    }
  }, [user]);

  // Only show for restaurant users
  if (!user || user.userType !== "RESTAURANT" || !subscription) {
    return null;
  }

  const isNearLimit =
    subscription.usage?.menuItems?.percentage >= 80 || subscription.usage?.ordersToday?.percentage >= 80;

  const getPlanColor = () => {
    switch (subscription.plan) {
      case "FREE":
        return "bg-gray-100 text-gray-700";
      case "BASIC":
        return "bg-blue-100 text-blue-700";
      case "PREMIUM":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="relative">
      <Link
        to="/restaurant"
        onClick={() => {
          // Switch to subscription tab
          setTimeout(() => {
            const element = document.querySelector('[data-tab="subscription"]');
            if (element) element.click();
          }, 100);
        }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition hover:shadow-md ${getPlanColor()}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Crown size={16} />
        <span>{subscription.plan}</span>
        {isNearLimit && <AlertCircle size={14} className="animate-pulse" />}
      </Link>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-fade-in">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b">
            <Crown size={20} className="text-orange-600" />
            <div>
              <p className="font-bold text-gray-900">{subscription.plan} Plan</p>
              <p className="text-xs text-gray-500">
                {subscription.endDate
                  ? `Until ${new Date(subscription.endDate).toLocaleDateString()}`
                  : "Active"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Menu Items</span>
                <span className="font-semibold text-gray-900">
                  {subscription.usage?.menuItems?.current}/{subscription.usage?.menuItems?.limit}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    subscription.usage?.menuItems?.percentage >= 80 ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(subscription.usage?.menuItems?.percentage || 0, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Orders Today</span>
                <span className="font-semibold text-gray-900">
                  {subscription.usage?.ordersToday?.current}/{subscription.usage?.ordersToday?.limit}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    subscription.usage?.ordersToday?.percentage >= 80 ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(subscription.usage?.ordersToday?.percentage || 0, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {isNearLimit && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-orange-600 flex items-center gap-1 mb-2">
                <AlertCircle size={12} />
                Approaching plan limits
              </p>
              <Link
                to="/subscriptions"
                className="block text-center text-xs bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold transition"
              >
                Upgrade Now
              </Link>
            </div>
          )}

          {subscription.plan !== "PREMIUM" && !isNearLimit && (
            <div className="mt-3 pt-3 border-t">
              <Link
                to="/subscriptions"
                className="flex items-center justify-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold"
              >
                <TrendingUp size={12} />
                View Plans
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionBadge;