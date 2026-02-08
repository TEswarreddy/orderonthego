import { Star, Edit2, Trash2 } from "lucide-react";

const ReviewCard = ({ review, onEdit, onDelete, showActions = false }) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
      />
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
            {review.userId?.username?.charAt(0).toUpperCase() || "U"}
          </div>

          {/* User Info */}
          <div>
            <p className="font-semibold text-gray-900">
              {review.userId?.username || "Anonymous"}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">{renderStars(review.rating)}</div>
              <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="p-2 hover:bg-blue-100 rounded-full transition"
              >
                <Edit2 size={16} className="text-blue-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review._id)}
                className="p-2 hover:bg-red-100 rounded-full transition"
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Comment */}
      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;
