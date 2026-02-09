import { Crown, CheckCircle, AlertCircle, Plus, Clock, TrendingUp, Star, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const SubscriptionTab = ({
  subscriptionUsage,
  availablePlans,
  cancelling,
  handleCancelSubscription,
  handleUpgradePlan,
}) => (
  <div className="space-y-6">
    {/* Current Plan Card */}
    {subscriptionUsage && (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Crown size={40} />
                <div>
                  <h2 className="text-3xl font-bold">{subscriptionUsage.plan} Plan</h2>
                  <p className="text-orange-100 text-sm mt-1">
                    {subscriptionUsage.isActive ? (
                      subscriptionUsage.endDate ? (
                        <>Valid until {new Date(subscriptionUsage.endDate).toLocaleDateString()}</>
                      ) : (
                        "Active • Forever Free"
                      )
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertCircle size={16} /> Subscription Expired - Please Renew
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2  bg-opacity-20 px-4 py-2 rounded-lg text-sm font-semibold">
                {subscriptionUsage.status === "ACTIVE" ? (
                  <>
                    <CheckCircle size={16} /> Active
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} /> {subscriptionUsage.status}
                  </>
                )}
              </div>
            </div>
            {subscriptionUsage.plan !== "FREE" && subscriptionUsage.status === "ACTIVE" && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="bg-red-600 bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                {cancelling ? "Cancelling..." : "Cancel Subscription"}
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Usage Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Menu Items</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {subscriptionUsage.usage.menuItems.current}
                    <span className="text-lg text-gray-500">/{subscriptionUsage.usage.menuItems.limit}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">
                    {subscriptionUsage.usage.menuItems.percentage}%
                  </p>
                  <p className="text-xs text-gray-500">Used</p>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all ${
                    subscriptionUsage.usage.menuItems.percentage >= 90
                      ? "bg-red-500"
                      : subscriptionUsage.usage.menuItems.percentage >= 80
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(subscriptionUsage.usage.menuItems.percentage, 100)}%` }}
                ></div>
              </div>
              {subscriptionUsage.usage.menuItems.percentage >= 80 && (
                <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  Approaching limit - Consider upgrading
                </p>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Orders Today</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {subscriptionUsage.usage.ordersToday.current}
                    <span className="text-lg text-gray-500">/{subscriptionUsage.usage.ordersToday.limit}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">
                    {subscriptionUsage.usage.ordersToday.percentage}%
                  </p>
                  <p className="text-xs text-gray-500">Used</p>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all ${
                    subscriptionUsage.usage.ordersToday.percentage >= 90
                      ? "bg-red-500"
                      : subscriptionUsage.usage.ordersToday.percentage >= 80
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(subscriptionUsage.usage.ordersToday.percentage, 100)}%` }}
                ></div>
              </div>
              {subscriptionUsage.usage.ordersToday.percentage >= 80 && (
                <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  High volume today - Upgrade for more capacity
                </p>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Plan Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Max Menu Items</p>
                <p className="font-bold text-gray-900">{subscriptionUsage.features.maxMenuItems}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Daily Orders</p>
                <p className="font-bold text-gray-900">{subscriptionUsage.features.maxOrdersPerDay}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Analytics</p>
                <p className="font-bold text-gray-900">
                  {subscriptionUsage.features.analyticsAccess ? "Enabled" : "Not Available"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority Support</p>
                <p className="font-bold text-gray-900">
                  {subscriptionUsage.features.prioritySupport ? "24/7 Available" : "Standard"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Crown size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Custom Branding</p>
                <p className="font-bold text-gray-900">
                  {subscriptionUsage.features.customBranding ? "Enabled" : "Not Available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Available Plans */}
    {subscriptionUsage && subscriptionUsage.plan !== "PREMIUM" && (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h3>
        <p className="text-gray-600 mb-6">
          Get more features and capacity by upgrading to a higher tier
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePlans
            .filter((plan) => {
              const planOrder = { FREE: 0, BASIC: 1, PREMIUM: 2 };
              return planOrder[plan.name] > planOrder[subscriptionUsage.plan];
            })
            .map((plan) => (
              <div
                key={plan.name}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-500 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Crown size={24} className="text-orange-600" />
                  <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                    {plan.name !== "FREE" && <span className="text-gray-600">/month</span>}
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgradePlan(plan.name)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Upgrade to {plan.name}
                </button>
              </div>
            ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/subscriptions"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
          >
            View all plans and features
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    )}

    {/* Help Section */}
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Need Help?</h3>
      <p className="text-gray-600 mb-4">
        Have questions about subscriptions or need assistance choosing the right plan?
      </p>
      <Link
        to="/help"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
      >
        Contact Support   
        <ArrowUpRight size={18} />
      </Link>
    </div>
  </div>
);

export default SubscriptionTab;
