const FieldStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'At Risk':
        return 'bg-red-100 text-red-800';
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor()}`}>
      {status}
    </span>
  );
};

export default FieldStatusBadge;