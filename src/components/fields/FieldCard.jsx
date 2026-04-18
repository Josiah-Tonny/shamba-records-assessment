import { Link } from 'react-router-dom';
import FieldStatusBadge from './FieldStatusBadge';

const FieldCard = ({ field }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{field.name}</h3>
          <p className="text-sm text-gray-500">{field.crop_type}</p>
        </div>
        <FieldStatusBadge status={field.status} />
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <p>
          <span className="font-medium">Planted:</span> {formatDate(field.planting_date)}
        </p>
        <p>
          <span className="font-medium">Stage:</span> {field.stage.charAt(0).toUpperCase() + field.stage.slice(1)}
        </p>
        {field.assigned_to_name && (
          <p>
            <span className="font-medium">Agent:</span> {field.assigned_to_name}
          </p>
        )}
      </div>

      <Link
        to={`/fields/${field.id}`}
        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
      >
        View Details →
      </Link>
    </div>
  );
};

export default FieldCard;