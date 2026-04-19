const FieldStatusBadge = ({ status }) => {
  const normalizedStatus = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  const getStatusColor = () => {
    switch (normalizedStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'at_risk':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (normalizedStatus) {
      case 'completed':
        return 'Completed';
      case 'at_risk':
        return 'At Risk';
      case 'active':
        return 'Active';
      default:
        return status;
    }
  };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor()}`}>
      {getStatusLabel()}
    </span>
  );
};

export default FieldStatusBadge;