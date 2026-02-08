const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="text-6xl mb-4">{icon || "📭"}</div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{title || "Nothing here"}</h3>

      {/* Description */}
      {description && <p className="text-gray-600 text-center mb-6 max-w-md">{description}</p>}

      {/* Action Button */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
