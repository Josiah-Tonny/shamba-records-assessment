import { Link } from 'react-router-dom';
import { MapPin, Calendar, User, ArrowRight, Sprout } from 'lucide-react';
import FieldStatusBadge from './FieldStatusBadge';
import Badge from '../ui/Badge';

const stageColors = {
  planted:   'warning',
  growing:   'success',
  ready:     'info',
  harvested: 'default',
};

const stageEmoji = {
  planted:   '🌱',
  growing:   '🌿',
  ready:     '🌾',
  harvested: '✅',
};

const FieldCard = ({ field }) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  const stageVariant = stageColors[field.stage] || 'default';
  const emoji        = stageEmoji[field.stage]  || '•';

  return (
    <div
      className="relative flex flex-col bg-[var(--bg-primary)] rounded-2xl
                 border border-[var(--border-light)] p-5 overflow-hidden
                 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--primary-300)]
                 transition-all duration-300 group animate-fade-in"
    >
      {/* Subtle top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl
                      bg-[var(--border-light)] group-hover:bg-[var(--primary-400)]
                      transition-colors duration-200" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[var(--text-primary)] truncate leading-snug">
            {field.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Sprout className="w-3.5 h-3.5 text-[var(--primary-500)] shrink-0" />
            <span className="text-sm text-[var(--text-secondary)] truncate">
              {field.crop_type}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <FieldStatusBadge status={field.status} />
        </div>
      </div>

      {/* Meta rows */}
      <div className="space-y-2 mb-5 flex-1">
        {/* Planting date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
          <span className="text-[var(--text-secondary)]">
            Planted:{' '}
            <span className="text-[var(--text-primary)] font-medium">
              {formatDate(field.planting_date)}
            </span>
          </span>
        </div>

        {/* Stage */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
          <span className="text-[var(--text-secondary)]">Stage:</span>
          <Badge variant={stageVariant} size="sm" className="flex items-center gap-1">
            <span>{emoji}</span>
            {field.stage.charAt(0).toUpperCase() + field.stage.slice(1)}
          </Badge>
        </div>

        {/* Assigned agent */}
        {field.assigned_to_name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <span className="text-[var(--text-secondary)]">
              Agent:{' '}
              <span className="text-[var(--text-primary)] font-medium">
                {field.assigned_to_name}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--border-light)] mb-4" />

      {/* CTA */}
      <Link
        to={`/fields/${field.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold
                   text-[var(--primary-600)] hover:text-[var(--primary-700)]
                   transition-colors group/link"
      >
        View Details
        <ArrowRight
          className="w-4 h-4 transition-transform duration-150
                     group-hover/link:translate-x-1"
        />
      </Link>
    </div>
  );
};

export default FieldCard;