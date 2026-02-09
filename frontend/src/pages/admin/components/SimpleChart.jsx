const SimpleChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      <div className="flex items-end gap-4 h-64">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div className="relative w-full flex items-end h-full group">
              <div
                className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition hover:shadow-lg hover:from-orange-600 hover:to-orange-500 cursor-pointer"
                style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: "20px" }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
            <p className="text-xs font-semibold text-gray-700 mt-3 text-center">
              {item.label}
            </p>
            <p className="text-sm font-bold text-orange-600">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleChart;
