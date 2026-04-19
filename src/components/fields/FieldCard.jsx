import { Link } from 'react-router-dom';
import { MapPin, Calendar, User, ArrowRight, Sprout, ChevronRight } from 'lucide-react';
import FieldStatusBadge from './FieldStatusBadge';
import Badge from '../ui/Badge';

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

  const emoji        = stageEmoji[field.stage]  || '•';

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl
                 border border-light p-0 overflow-hidden
                 hover:shadow-2xl hover:shadow-primary-100/50 hover:border-primary-200
                 transition-all duration-300 animate-fade-in"
    >
      {/* Decorative Image/Pattern Placeholder */}
      <div className="h-24 bg-gradient-to-br from-primary-500/10 to-primary-600/5 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute top-4 left-4">
           <FieldStatusBadge status={field.status} />
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-100/40 rounded-full blur-2xl group-hover:bg-primary-200/40 transition-colors" />
      </div>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-primary truncate leading-tight group-hover:text-primary-600 transition-colors">
              {field.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-5 h-5 rounded-md bg-earth-100 flex items-center justify-center">
                <Sprout className="w-3 h-3 text-primary-600 shrink-0" />
              </div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                {field.crop_type}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-earth-50/50 border border-light/50">
            <div className="flex items-center gap-1.5 mb-1 opacity-60">
              <Calendar className="w-3 h-3 text-muted" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Planted</span>
            </div>
            <p className="text-xs font-bold text-primary">
              {formatDate(field.planting_date)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-earth-50/50 border border-light/50">
            <div className="flex items-center gap-1.5 mb-1 opacity-60">
              <MapPin className="w-3 h-3 text-muted" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Stage</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs">{emoji}</span>
              <span className="text-xs font-bold text-primary">
                {field.stage.charAt(0).toUpperCase() + field.stage.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Agent Info */}
        {field.assigned_to_name && (
          <div className="flex items-center justify-between py-3 border-t border-dashed border-light">
             <div className="flex items-center gap-2">
               <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                 <User className="w-3.5 h-3.5 text-primary-600" />
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-muted uppercase tracking-tighter leading-none mb-0.5">Assigned Agent</span>
                 <span className="text-xs font-bold text-primary">{field.assigned_to_name}</span>
               </div>
             </div>
             <ChevronRight className="w-4 h-4 text-muted opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        )}

        <div className="mt-auto pt-4">
          <Link
            to={`/fields/${field.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold
                       bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-200
                       transition-all active:scale-[0.98]"
          >
            Manage Field
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FieldCard;
