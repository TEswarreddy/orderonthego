const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className={`bg-gradient-to-br ${color} text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-opacity-80 text-sm font-semibold mb-2">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <Icon size={40} className="opacity-20" />
    </div>
  </div>
);

export default StatCard;
