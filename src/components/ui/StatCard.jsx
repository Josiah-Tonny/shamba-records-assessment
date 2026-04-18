const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon && (
          <div className="text-4xl text-indigo-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;