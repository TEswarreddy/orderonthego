import { Search, X } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search...", onClear }) => {
  return (
    <div className="relative w-full">
      <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
      />
      {value && (
        <button
          onClick={() => {
            onChange("");
            if (onClear) onClear();
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
        >
          <X size={18} className="text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
