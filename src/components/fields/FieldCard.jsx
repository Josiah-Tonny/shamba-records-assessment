import { Link } from 'react-router-dom';
import { MapPin, Calendar, User, ArrowRight, Sprout, ChevronRight } from 'lucide-react';
import FieldStatusBadge from './FieldStatusBadge';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/dateUtils';

const stageEmoji = {
  planted:   '🌱',
  growing:   '🌿',
  ready:     '🌾',
  harvested: '✅',
};

const FieldCard = ({ field }) => {
  const emoji = stageEmoji[field.stage] || '•';

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl
                 border border-gray-200 p-0 overflow-hidden
                 hover:shadow-xl hover:border-emerald-200
                 transition-all duration-200 animate-fade-in"
    >
      {/* Decorative Image/Pattern Placeholder */}
      <div className="h-24 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 relative overflow-hidden shrink-0">
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
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-100/40 rounded-full blur-2xl group-hover:bg-emerald-200/40 transition-colors" />
      </div>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate leading-tight group-hover:text-emerald-600 transition-colors">
              {field.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center">
                <Sprout className="w-3 h-3 text-emerald-600 shrink-0" />
              </div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {field.crop_type}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-semibold uppercase tracking-tight text-gray-500">Planted</span>
            </div>
            <p className="text-xs font-semibold text-gray-900">
              {formatDate(field.planting_date)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-semibold uppercase tracking-tight text-gray-500">Stage</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs">{emoji}</span>
              <span className="text-xs font-semibold text-gray-900">
                {field.stage.charAt(0).toUpperCase() + field.stage.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Agent Info */}
        {field.assigned_to_name && (
          <div className="flex items-center justify-between py-3 border-t border-dashed border-gray-200">
             <div className="flex items-center gap-2">
               <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                 <User className="w-3.5 h-3.5 text-emerald-600" />
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tighter leading-none mb-0.5">Assigned Agent</span>
                 <span className="text-xs font-semibold text-gray-900">{field.assigned_to_name}</span>
               </div>
             </div>
             <ChevronRight className="w-4 h-4 text-gray-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        )}

        <div className="mt-auto pt-4">
          <Link
            to={`/fields/${field.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold
                       bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200
                       transition-all hover:-translate-y-0.5 active:translate-y-0"
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
