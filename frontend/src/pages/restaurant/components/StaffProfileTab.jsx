import { useEffect, useState } from "react";
import axios from "../../../api/axios";
import VerificationModal from "../../../components/VerificationModal";

const StaffProfileTab = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/staff/profile");
      setProfile(response.data);
      setFormData({
        username: response.data.username || "",
        phone: response.data.phone || "",
        address: response.data.address || "",
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userType !== "STAFF") {
      return;
    }

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await axios.put("/staff/profile", formData);
      setProfile((prev) => ({
        ...prev,
        ...response.data.user,
      }));
      setSuccess("Profile updated successfully.");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-lg bg-white p-6 shadow">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-red-600">{error || "Profile not found"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-2xl font-bold text-gray-900">Staff Profile</h2>
        <p className="text-gray-600">Update your contact details below.</p>

        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
              placeholder="Enter address"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-600 px-5 py-2 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <div className="text-sm text-gray-500">
              Email: <span className="font-semibold text-gray-700">{profile.email}</span>
            </div>
          </div>
        </form>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs uppercase text-gray-500">Role</p>
            <p className="mt-1 font-semibold text-gray-800">{profile.staffRole || "STAFF"}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs uppercase text-gray-500">Email Verification</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="font-semibold text-gray-800">
                {profile.emailVerified ? "Verified" : "Pending"}
              </p>
              {!profile.emailVerified && (
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(true)}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  Verify Email
                </button>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs uppercase text-gray-500">Status</p>
            <p className="mt-1 font-semibold text-gray-800">{profile.status || "ACTIVE"}</p>
          </div>
        </div>
      </div>

      {profile.restaurant && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Restaurant Details</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase text-gray-500">Name</p>
              <p className="mt-1 font-semibold text-gray-800">
                {profile.restaurant.title || "Not available"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase text-gray-500">Cuisine</p>
              <p className="mt-1 font-semibold text-gray-800">
                {profile.restaurant.cuisineType || "Not available"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase text-gray-500">Phone</p>
              <p className="mt-1 font-semibold text-gray-800">
                {profile.restaurant.phone || "Not available"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs uppercase text-gray-500">Address</p>
              <p className="mt-1 font-semibold text-gray-800">
                {profile.restaurant.address || "Not available"}
              </p>
            </div>
            {profile.restaurant.description && (
              <div className="rounded-lg border border-gray-200 p-4 sm:col-span-2">
                <p className="text-xs uppercase text-gray-500">Description</p>
                <p className="mt-1 text-gray-800">{profile.restaurant.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showVerificationModal && (
        <VerificationModal
          email={profile.email}
          phone={profile.phone}
          onVerificationComplete={() => {
            setShowVerificationModal(false);
            setSuccess("Email verified successfully.");
            fetchProfile();
          }}
          onSkip={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  );
};

export default StaffProfileTab;
