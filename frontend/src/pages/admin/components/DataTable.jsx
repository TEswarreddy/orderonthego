import { Edit2, Eye, Trash2 } from "lucide-react";

const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  renderActions,
  maxRows = 10,
  loading = false,
}) => {
  const displayed = data.slice(0, maxRows);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="text-left py-4 px-6 font-semibold text-gray-800"
              >
                {col}
              </th>
            ))}
            <th className="text-left py-4 px-6 font-semibold text-gray-800">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {displayed.length > 0 ? (
            displayed.map((row) => (
              <tr
                key={row._id || row.id}
                className="border-b hover:bg-orange-50 transition"
              >
                {columns.map((col) => (
                  <td key={col} className="py-4 px-6 text-gray-700">
                    {col === "Amount" || col === "Revenue"
                      ? `₹${(row[col.toLowerCase()] ?? 0).toFixed(2)}`
                      : col === "Approval"
                      ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              row.approval
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {row.approval ? "approved" : "pending"}
                          </span>
                        )
                      : col === "Status"
                      ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              row.status === "active" ||
                              row.status === "DELIVERED" ||
                              row.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : row.status === "PLACED" ||
                                  row.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : row.status === "PREPARING" ||
                                  row.status === "inactive"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {String(row.status || "N/A").replace(/_/g, " ")}
                          </span>
                        )
                      : String(row[col.toLowerCase()] || "N/A")}
                  </td>
                ))}
                <td className="py-4 px-6">
                  {renderActions ? (
                    <div className="flex flex-wrap gap-2">
                      {renderActions(row)}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(row)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition"
                          title="View"
                        >
                          <Eye size={18} className="text-gray-600" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={18} className="text-blue-600" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="p-2 hover:bg-red-100 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="py-8 text-center text-gray-500">
                {loading ? "Loading..." : "No data found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
