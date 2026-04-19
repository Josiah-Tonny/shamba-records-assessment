import { Link } from 'react-router-dom';
import { MapPin, Calendar, User, ArrowRight, Sprout } from 'lucide-react';
import FieldStatusBadge from './FieldStatusBadge';
import Badge from '../ui/Badge';

const stageColors = {
  planted: 'warning',
  growing: 'success',
  ready: 'info',
  harvested: 'default',
};

const FieldCard = ({ field }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stageVariant = stageColors[field.stage] || 'default';

  return (
    <div 
      className="bg-white rounded-xl border border-[var(--border-light)] p-5 
                 hover:shadow-lg hover:border-[var(--primary-300)] 
                 transition-all duration-200 group"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">
            {field.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Sprout className="w-4 h-4 text-[var(--primary-500)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              {field.crop_type}
            </span>
          </div>
        </div>
        <FieldStatusBadge status={field.status} />
      </div>

      {/* Details */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-[var(--text-secondary)]">
            Planted: <span className="text-[var(--text-primary)] font-medium">{formatDate(field.planting_date)}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-[var(--text-secondary)]">
            Stage: 
            <Badge variant={stageVariant} size="sm" className="ml-1.5">
              {field.stage.charAt(0).toUpperCase() + field.stage.slice(1)}
            </Badge>
          </span>
        </div>
        
        {field.assigned_to_name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-[var(--text-secondary)]">
              Agent: <span className="text-[var(--text-primary)] font-medium">{field.assigned_to_name}</span>
            </span>
          </div>
        )}
      </div>

      {/* Action */}
      <Link
        to={`/fields/${field.id}`}
        className="flex items-center gap-2 text-sm font-medium text-[var(--primary-600)] 
                   hover:text-[var(--primary-700)] transition-colors group-hover:gap-3"
      >
        View Details
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
};

export default FieldCard;