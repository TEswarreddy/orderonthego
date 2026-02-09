import { useState, useEffect, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { Check, Crown, Zap, TrendingUp, Shield, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubscriptionPlans = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    const fetchPlansAndSubscription = async () => {
      try {
        setLoading(true);
        const [plansRes, subRes] = await Promise.all([
          axios.get("/subscriptions/plans"),
          user && user.userType === "RESTAURANT" ? axios.get("/subscriptions/my-subscription") : Promise.resolve(null),
        ]);
        setPlans(plansRes.data || []);
        setCurrentSubscription(subRes?.data || null);
      } catch (err) {
        console.error("Failed to fetch subscription data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlansAndSubscription();
  }, [user]);

  const handleSubscribe = async (planName) => {
    if (!user) {
      alert("Please login as a restaurant owner to subscribe");
      navigate("/login");
      return;
    }

    if (user.userType !== "RESTAURANT") {
      alert("Only restaurant owners can subscribe to plans");
      return;
    }

    if (currentSubscription?.plan === planName) {
      alert("You are already subscribed to this plan");
      return;
    }

    setSubscribing(planName);

    try {
      if (planName === "FREE") {
        await axios.post("/subscriptions/subscribe", { plan: "FREE" });
        alert("✅ Successfully downgraded to FREE plan");
        window.location.reload();
      } else {
        // For paid plans, integrate with Razorpay
        const plan = plans.find((p) => p.name === planName);
        if (!plan) return;

        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
          alert("❌ Razorpay is not configured. Please add VITE_RAZORPAY_KEY_ID to your frontend env.");
          return;
        }

        const options = {
          key: razorpayKey,
          amount: plan.price * 100, // Razorpay expects amount in paise
          currency: "INR",
          name: "Order On The Go",
          description: `${planName} Subscription`,
          handler: async function (response) {
            try {
              await axios.post("/subscriptions/subscribe", {
                plan: planName,
                paymentDetails: {
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                },
              });
              alert(`✅ Successfully subscribed to ${planName} plan!`);
              window.location.reload();
            } catch (err) {
              alert("❌ " + (err.response?.data?.message || "Subscription failed"));
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#f97316",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Subscription failed"));
    } finally {
      setSubscribing(null);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName) {
      case "FREE":
        return Zap;
      case "BASIC":
        return TrendingUp;
      case "PREMIUM":
        return Crown;
      default:
        return Star;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Crown size={18} />
            Subscription Plans
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose the Perfect Plan for Your Restaurant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scale your business with our flexible subscription plans. Upgrade anytime as you grow.
          </p>

          {currentSubscription && (
            <div className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-lg font-semibold">
              <Shield size={20} />
              Current Plan: {currentSubscription.plan}
              {currentSubscription.endDate && (
                <span className="text-sm opacity-80">
                  (Valid until {new Date(currentSubscription.endDate).toLocaleDateString()})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const isCurrentPlan = currentSubscription?.plan === plan.name;

            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition hover:scale-105 ${
                  plan.popular ? "ring-4 ring-orange-500" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 text-sm font-bold rounded-bl-2xl">
                    ⭐ POPULAR
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-3 rounded-lg ${
                        plan.name === "FREE"
                          ? "bg-gray-100"
                          : plan.name === "BASIC"
                          ? "bg-blue-100"
                          : "bg-gradient-to-br from-orange-500 to-red-500"
                      }`}
                    >
                      <Icon
                        size={28}
                        className={plan.name === "PREMIUM" ? "text-white" : "text-gray-700"}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500">
                        {plan.name === "FREE"
                          ? "Get started for free"
                          : plan.name === "BASIC"
                          ? "For growing restaurants"
                          : "For established businesses"}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">₹{plan.price}</span>
                      {plan.name !== "FREE" && <span className="text-gray-600">/month</span>}
                    </div>
                    {plan.name === "FREE" && <p className="text-sm text-gray-500 mt-1">Forever free</p>}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={isCurrentPlan || subscribing === plan.name}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                      isCurrentPlan
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : plan.popular
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {subscribing === plan.name
                      ? "Processing..."
                      : isCurrentPlan
                      ? "Current Plan"
                      : plan.name === "FREE"
                      ? "Get Started"
                      : "Upgrade Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Feature Comparison</h2>
          <p className="text-gray-600 text-center mb-8">See what's included in each plan</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="text-center py-4 px-4 font-semibold text-gray-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Maximum Menu Items</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4 font-semibold text-gray-900">
                      {plan.maxMenuItems}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Orders Per Day</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4 font-semibold text-gray-900">
                      {plan.maxOrdersPerDay}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Analytics Dashboard</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4">
                      {plan.analyticsAccess ? (
                        <Check size={20} className="text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Priority Support</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4">
                      {plan.prioritySupport ? (
                        <Check size={20} className="text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Custom Branding</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4">
                      {plan.customBranding ? (
                        <Check size={20} className="text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Have Questions?</h2>
          <p className="text-gray-600 mb-6">
            Contact our support team or check our{" "}
            <a href="/faqs" className="text-orange-600 hover:underline font-semibold">
              FAQ page
            </a>{" "}
            for more information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
