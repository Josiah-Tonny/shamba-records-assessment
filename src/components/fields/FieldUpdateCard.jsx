import { stageIcon, capitalize } from '../../utils/fieldUtils';
import { formatDate } from '../../utils/dateUtils';
import Badge from '../ui/Badge';

/**
 * FieldUpdateCard component displays a single field update entry
 * Shows the agent name, stage, date, and notes in a visually appealing card
 * 
 * @param {Object} props
 * @param {Object} props.update - The update object containing agent_name, stage, notes, created_at
 * @param {boolean} props.isLast - Whether this is the last update in the list (for timeline styling)
 * @param {number} props.index - The index of this update in the list
 */
const FieldUpdateCard = ({ update, isLast = false, index = 0 }) => {
  return (
    <article className="flex gap-4 group" role="listitem">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-[var(--primary-100)] border-2 border-[var(--bg-primary)] flex items-center justify-center text-base shrink-0 z-10 shadow-sm" aria-hidden="true">
          {stageIcon(update.stage)}
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-[var(--border-light)] my-1" aria-hidden="true" />
        )}
      </div>

      {/* Update Content */}
      <div className="flex-1 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {update.agent_name}
            </span>
            <Badge variant="success" size="sm" className="capitalize">
              → {update.stage}
            </Badge>
          </div>
          <time className="text-xs text-[var(--text-muted)]" dateTime={update.created_at}>
            {formatDate(update.created_at)}
          </time>
        </div>
        {update.notes && (
          <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-xl px-4 py-3 border border-[var(--border-light)] leading-relaxed">
            {update.notes}
          </p>
        )}
      </div>
    </article>
  );
};

export default FieldUpdateCard;
