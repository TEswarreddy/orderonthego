import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Upload, Trash2 } from "lucide-react";

const AdminProfile = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    address: "",
  });
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    if (!user || user.userType !== "ADMIN") {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/admin/profile");

      setProfile(response.data);
      setFormData({
        username: response.data.username,
        phone: response.data.phone || "",
        address: response.data.address || "",
      });
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch admin profile"
      );
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only images are allowed (JPEG, PNG, GIF, WEBP)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      return;
    }

    try {
      setImageLoading(true);

      const response = await axios.post(
        "/admin/profile/image",
        file,
        {
          headers: {
            "Content-Type": file.type,
          },
        }
      );

      setProfile((prev) => ({
        ...prev,
        profileImage: response.data.profileImage,
      }));

      const updatedUser = { ...user, profileImage: response.data.profileImage };
      login(updatedUser);

      setUpdateSuccess("Profile image updated successfully!");
      setTimeout(() => setUpdateSuccess(""), 3000);
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to upload image";
      setError(errorMsg);
      console.error("Error uploading image:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your profile image?")) {
      return;
    }

    try {
      setImageLoading(true);

      await axios.delete(
        "/admin/profile/image"
      );

      setProfile((prev) => ({
        ...prev,
        profileImage: null,
      }));

      const updatedUser = { ...user, profileImage: null };
      login(updatedUser);

      setUpdateSuccess("Profile image deleted successfully!");
      setTimeout(() => setUpdateSuccess(""), 3000);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete image"
      );
      console.error("Error deleting image:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("/admin/profile", formData);

      setProfile((prev) => ({
        ...prev,
        ...response.data.user,
      }));

      const updatedUser = { ...user, ...response.data.user };
      login(updatedUser);

      setIsEditing(false);
      setUpdateSuccess("Profile updated successfully!");
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update profile"
      );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-600">{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-red-600 to-red-800 h-32"></div>

          <div className="px-6 pb-6 pt-0">
            {/* Success Message */}
            {updateSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {updateSuccess}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Profile Image Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              {/* Image Display/Upload Area */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-400 to-red-700 flex items-center justify-center overflow-hidden shadow-lg">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">⚙️</span>
                  )}
                </div>

                {/* Image Upload Button */}
                <label className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                  <Upload size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageLoading}
                    className="hidden"
                  />
                </label>

                {/* Delete Image Button */}
                {profile.profileImage && (
                  <button
                    onClick={handleImageDelete}
                    disabled={imageLoading}
                    className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                )}

                {imageLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="text-white text-sm">Uploading...</div>
                  </div>
                )}
              </div>

              {/* Profile Header with Badge */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.username}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    ADMIN
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Active
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {/* Profile Information */}
            {!isEditing ? (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Email Address
                      </label>
                      <p className="mt-1 text-lg text-gray-900">
                        {profile.email}
                      </p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Phone
                      </label>
                      <p className="mt-1 text-lg text-gray-900">
                        {profile.phone || "Not provided"}
                      </p>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Address
                      </label>
                      <p className="mt-1 text-lg text-gray-900">
                        {profile.address || "Not provided"}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Account Status
                      </label>
                      <p className="mt-1 text-lg text-gray-900 capitalize">
                        {profile.status}
                      </p>
                    </div>

                    {/* Member Since */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Member Since
                      </label>
                      <p className="mt-1 text-lg text-gray-900">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleEditSubmit} className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your address"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Additional Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="text-lg font-semibold text-gray-900">ADMIN</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Email Verification</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile.emailVerified ? (
                  <span className="text-green-600">✓ Verified</span>
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Account Status</p>
              <p className="text-lg font-semibold text-gray-900">
                <span className="text-green-600">✓ Active</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
