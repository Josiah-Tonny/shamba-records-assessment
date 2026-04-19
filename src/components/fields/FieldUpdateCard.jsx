import { stageIcon } from '../../utils/fieldUtils';
import { User, History } from 'lucide-react';

const FieldUpdateCard = ({ update, isLast = false, index = 0 }) => {
  return (
    <article 
      className="relative z-10 flex gap-6 group animate-fade-in" 
      style={{ animationDelay: `${index * 100}ms` }}
      role="listitem"
    >
      {/* Timeline Icon & Spine */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-12 h-12 rounded-2xl bg-white border border-light shadow-sm flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
          <div className="text-xl">{stageIcon(update.stage)}</div>
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-light group-hover:bg-primary-200 transition-colors" aria-hidden="true" />
        )}
      </div>

      {/* Update Content */}
      <div className="flex-1 pb-8">
        <div className="bg-white border border-light rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group/card relative">
          {/* Subtle accent corner */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary-50 rounded-bl-[100%] opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-primary-100/50 text-primary-700 text-[10px] font-black uppercase tracking-widest border border-primary-200/30">
                Phase: {update.stage}
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-earth-50 text-[10px] font-bold text-muted">
                <User className="w-3 h-3" />
                {update.agent_name}
              </div>
            </div>
            
            <time className="text-[10px] font-black text-muted tabular-nums bg-earth-50 border border-light/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <History className="w-3 h-3 opacity-50" />
              {new Date(update.created_at).toLocaleString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </time>
          </div>

          {update.notes && (
            <div className="relative">
              <p className="text-sm text-secondary leading-relaxed bg-earth-50/50 p-4 rounded-xl italic border-l-4 border-primary-300 font-medium relative z-10">
                "{update.notes}"
              </p>
            </div>
          )}
          
          {/* Status highlight based on stage */}
          <div className="mt-4 flex items-center justify-end gap-2 opacity-0 group-hover/card:opacity-100 transition-all transform translate-y-2 group-hover/card:translate-y-0">
             <span className="text-[10px] font-bold text-muted uppercase tracking-tighter italic">Verified Log</span>
             <div className="w-2 h-2 rounded-full bg-success-500" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default FieldUpdateCard;
