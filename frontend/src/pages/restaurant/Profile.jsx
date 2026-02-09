import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Upload, Trash2 } from "lucide-react";

const RestaurantProfile = () => {
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
    restaurantTitle: "",
    restaurantAddress: "",
    restaurantPhone: "",
    cuisineType: "",
    description: "",
  });
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    if (!user || user.userType !== "RESTAURANT") {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/restaurants/profile");

      setProfile(response.data);
      setFormData({
        username: response.data.user.username,
        phone: response.data.user.phone || "",
        address: response.data.user.address || "",
        restaurantTitle: response.data.restaurant.title,
        restaurantAddress: response.data.restaurant.address,
        restaurantPhone: response.data.restaurant.phone || "",
        cuisineType: response.data.restaurant.cuisineType || "",
        description: response.data.restaurant.description || "",
      });
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch restaurant profile"
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

  const handleImageUpload = async (e, imageType = "restaurant") => {
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

      const endpoint =
        imageType === "restaurant"
          ? "/restaurants/profile/image"
          : "/restaurants/profile/user-image";

      const response = await axios.post(endpoint, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      if (imageType === "restaurant") {
        setProfile((prev) => ({
          ...prev,
          restaurant: {
            ...prev.restaurant,
            profileImage: response.data.profileImage,
          },
        }));
      } else {
        setProfile((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            profileImage: response.data.profileImage,
          },
        }));
        const updatedUser = { ...user, profileImage: response.data.profileImage };
        login(updatedUser);
      }

      setUpdateSuccess("Image updated successfully!");
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

  const handleImageDelete = async (imageType = "restaurant") => {
    if (!window.confirm(`Are you sure you want to delete the ${imageType} image?`)) {
      return;
    }

    try {
      setImageLoading(true);

      const endpoint =
        imageType === "restaurant"
          ? "/restaurants/profile/image"
          : "/restaurants/profile/user-image";

      await axios.delete(endpoint);

      if (imageType === "restaurant") {
        setProfile((prev) => ({
          ...prev,
          restaurant: {
            ...prev.restaurant,
            profileImage: null,
          },
        }));
      } else {
        setProfile((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            profileImage: null,
          },
        }));
        const updatedUser = { ...user, profileImage: null };
        login(updatedUser);
      }

      setUpdateSuccess("Image deleted successfully!");
      setTimeout(() => setUpdateSuccess(""), 3000);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete image");
      console.error("Error deleting image:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("/restaurants/profile", formData);

      setProfile(response.data);
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 h-32"></div>

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

            {/* Restaurant Images Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Restaurant Image */}
              <div className="relative">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Restaurant Image</h3>
                <div className="w-full h-48 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden shadow-lg">
                  {profile.restaurant.profileImage ? (
                    <img
                      src={profile.restaurant.profileImage}
                      alt={profile.restaurant.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🏪</span>
                  )}
                </div>

                <label className="absolute bottom-3 right-3 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                  <Upload size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "restaurant")}
                    disabled={imageLoading}
                    className="hidden"
                  />
                </label>

                {profile.restaurant.profileImage && (
                  <button
                    onClick={() => handleImageDelete("restaurant")}
                    disabled={imageLoading}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              {/* Owner Image */}
              <div className="relative">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Owner Image</h3>
                <div className="w-full h-48 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center overflow-hidden shadow-lg">
                  {profile.user.profileImage ? (
                    <img
                      src={profile.user.profileImage}
                      alt={profile.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">👤</span>
                  )}
                </div>

                <label className="absolute bottom-3 right-3 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                  <Upload size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "owner")}
                    disabled={imageLoading}
                    className="hidden"
                  />
                </label>

                {profile.user.profileImage && (
                  <button
                    onClick={() => handleImageDelete("owner")}
                    disabled={imageLoading}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.restaurant.title}
                </h1>
                <p className="text-lg text-gray-600 mt-1">{profile.user.username}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    RESTAURANT
                  </span>
                  {!profile.user.approval && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      ⏳ Pending Approval
                    </span>
                  )}
                  {profile.user.approval && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ Approved
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {/* Profile Information */}
            {!isEditing ? (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Owner Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Owner Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-gray-900">{profile.user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                        <p className="mt-1 text-gray-900">{profile.user.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Address</label>
                        <p className="mt-1 text-gray-900">{profile.user.address || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Restaurant Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Cuisine Type</label>
                        <p className="mt-1 text-gray-900">{profile.restaurant.cuisineType || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Restaurant Phone</label>
                        <p className="mt-1 text-gray-900">{profile.restaurant.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Restaurant Address</label>
                        <p className="mt-1 text-gray-900">{profile.restaurant.address || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-gray-900">{profile.restaurant.description || "No description provided"}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleEditSubmit} className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Owner Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Restaurant Name</label>
                    <input
                      type="text"
                      name="restaurantTitle"
                      value={formData.restaurantTitle}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Owner Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Restaurant Phone</label>
                    <input
                      type="tel"
                      name="restaurantPhone"
                      value={formData.restaurantPhone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cuisine Type</label>
                    <input
                      type="text"
                      name="cuisineType"
                      value={formData.cuisineType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., Italian, Chinese, Indian"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Owner Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Restaurant Address</label>
                    <input
                      type="text"
                      name="restaurantAddress"
                      value={formData.restaurantAddress}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Tell us about your restaurant"
                    ></textarea>
                  </div>
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
      </div>
    </div>
  );
};

export default RestaurantProfile;
