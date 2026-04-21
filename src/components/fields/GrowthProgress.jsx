import { stageIcon } from '../../utils/fieldUtils';

const STAGES = ['planted', 'growing', 'ready', 'harvested'];

/**
 * GrowthProgress component displays the stage timeline for a field
 * Shows progress through the growth stages with visual indicators
 * 
 * @param {Object} props
 * @param {string} props.currentStage - The current growth stage of the field
 */
const GrowthProgress = ({ currentStage }) => {
  const currentIdx = STAGES.indexOf(currentStage);

  return (
    <div className="mt-6 pt-5 border-t border-light" role="progressbar" aria-valuenow={currentIdx + 1} aria-valuemin="1" aria-valuemax={STAGES.length} aria-label="Growth progress">
      <p className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
        Growth Progress
      </p>
      <div className="flex items-center gap-0">
        {STAGES.map((stage, idx) => {
          const isPast = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFuture = idx > currentIdx;

          return (
            <div key={stage} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                    ${isCurrent ? 'bg-primary border-primary text-white scale-110 shadow-md' : ''}
                    ${isPast ? 'bg-primary-mid border-primary-mid text-white' : ''}
                    ${isFuture ? 'bg-surface-2 border-light text-muted' : ''}
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isPast ? '✓' : stageIcon(stage)}
                </div>
                <p
                  className={`text-xs mt-1.5 font-medium capitalize
                    ${isCurrent ? 'text-primary' : ''}
                    ${isPast ? 'text-text' : ''}
                    ${isFuture ? 'text-muted' : ''}
                  `}
                >
                  {stage}
                </p>
              </div>
              {idx < STAGES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 -mt-5 mx-1 rounded
                    ${idx < currentIdx ? 'bg-primary-mid' : 'bg-border-light'}
                  `}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GrowthProgress;
