const StatCard = ({ icon: Icon, title, value, color, subtext }) => (
  <div className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-lg p-6 transition hover:-translate-y-1 hover:shadow-xl`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subtext && <p className="text-xs opacity-75 mt-1">{subtext}</p>}
      </div>
      <Icon size={40} className="opacity-50" />
    </div>
  </div>
);

export default StatCard;
