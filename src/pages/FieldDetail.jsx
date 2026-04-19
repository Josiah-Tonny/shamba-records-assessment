import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import FieldStatusBadge from '../components/fields/FieldStatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SidebarLayout from '../components/layout/SidebarLayout';
import {
  ArrowLeft, CalendarDays, Sprout, User,
  ClipboardList, ChevronDown, AlertTriangle, Send
} from 'lucide-react';

const STAGES = ['planted', 'growing', 'ready', 'harvested'];

const stageIcon = (stage) => {
  const map = { planted: '🌱', growing: '🌿', ready: '🌾', harvested: '✅' };
  return map[stage] ?? '•';
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

const FieldDetail = () => {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [field, setField]         = useState(null);
  const [updates, setUpdates]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [newStage, setNewStage]   = useState('');
  const [newNotes, setNewNotes]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchFieldData(); }, [id]);

  const fetchFieldData = async () => {
    try {
      setLoading(true);
      const [fieldRes, updatesRes] = await Promise.all([
        api.get(`/fields/${id}`),
        api.get(`/fields/${id}/updates`),
      ]);
      const fetchedField = fieldRes.data.data.field;
      setField(fetchedField);
      setUpdates(updatesRes.data.data.updates);
      setNewStage(fetchedField.stage);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load field');
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!newStage) return;
    try {
      setSubmitting(true);
      await api.post(`/fields/${id}/updates`, { stage: newStage, notes: newNotes });
      setNewNotes('');
      await fetchFieldData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post update');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading / Error states ── */
  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </SidebarLayout>
    );
  }

  if (error && !field) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--error-50)] border border-[var(--error-200)]">
            <AlertTriangle className="w-5 h-5 text-[var(--error-600)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--error-700)]">{error}</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!field) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto py-8 px-4 text-center text-[var(--text-secondary)]">
          Field not found
        </div>
      </SidebarLayout>
    );
  }

  const isAssignedAgent = user?.id === field.assigned_to;
  const capitalize      = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto py-6 px-4">

        {/* ── Back Button ── */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--primary-600)]
                     hover:text-[var(--primary-800)] mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Dashboard
        </button>

        {/* ── Error Banner (non-fatal, e.g. failed to post update) ── */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-[var(--error-50)] border border-[var(--error-200)]">
            <AlertTriangle className="w-5 h-5 text-[var(--error-600)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--error-700)]">{error}</p>
          </div>
        )}

        {/* ── Field Header Card ── */}
        <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                {field.name}
              </h1>
              <p className="text-[var(--text-secondary)] mt-1 text-sm">{field.crop_type}</p>
            </div>
            <FieldStatusBadge status={field.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Planting Date */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary-100)] flex items-center justify-center shrink-0 mt-0.5">
                <CalendarDays className="w-4 h-4 text-[var(--primary-600)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">
                  Planted
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                  {formatDate(field.planting_date)}
                </p>
              </div>
            </div>
            {/* Current Stage */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary-100)] flex items-center justify-center shrink-0 mt-0.5">
                <Sprout className="w-4 h-4 text-[var(--primary-600)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">
                  Stage
                </p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                  {stageIcon(field.stage)} {capitalize(field.stage)}
                </p>
              </div>
            </div>
            {/* Assigned Agent */}
            {field.assigned_to_name && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary-100)] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-[var(--primary-600)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">
                    Agent
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                    {field.assigned_to_name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stage Progress Bar */}
          <div className="mt-6 pt-5 border-t border-[var(--border-light)]">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
              Growth Progress
            </p>
            <div className="flex items-center gap-0">
              {STAGES.map((stage, idx) => {
                const currentIdx  = STAGES.indexOf(field.stage);
                const isPast      = idx < currentIdx;
                const isCurrent   = idx === currentIdx;
                const isFuture    = idx > currentIdx;
                return (
                  <div key={stage} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                        ${isCurrent ? 'bg-[var(--primary-600)] border-[var(--primary-600)] text-white scale-110 shadow-md' : ''}
                        ${isPast    ? 'bg-[var(--primary-500)] border-[var(--primary-500)] text-white' : ''}
                        ${isFuture  ? 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-muted)]' : ''}
                      `}>
                        {isPast ? '✓' : stageIcon(stage)}
                      </div>
                      <p className={`text-xs mt-1.5 font-medium capitalize
                        ${isCurrent ? 'text-[var(--primary-600)]' : ''}
                        ${isPast    ? 'text-[var(--text-secondary)]' : ''}
                        ${isFuture  ? 'text-[var(--text-muted)]' : ''}
                      `}>
                        {stage}
                      </p>
                    </div>
                    {idx < STAGES.length - 1 && (
                      <div className={`h-0.5 flex-1 -mt-5 mx-1 rounded
                        ${idx < currentIdx ? 'bg-[var(--primary-500)]' : 'bg-[var(--border-default)]'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Agent Update Form ── */}
        {isAssignedAgent && (
          <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] shadow-sm p-6 mb-6">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[var(--primary-100)] flex items-center justify-center">
                <Send className="w-3.5 h-3.5 text-[var(--primary-600)]" />
              </span>
              Post an Update
            </h2>

            <form onSubmit={handlePostUpdate} className="space-y-4">
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Current Stage
                </label>
                <div className="relative">
                  <select
                    id="stage"
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-[var(--border-default)]
                               bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm
                               focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]
                               transition-colors"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {stageIcon(s)} {capitalize(s)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Observations & Notes
                  <span className="ml-1.5 text-xs font-normal text-[var(--text-muted)]">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)]
                             bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm
                             placeholder:text-[var(--text-muted)]
                             focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]
                             resize-none transition-colors"
                  placeholder="Describe current field conditions, observations, or any concerns…"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-white
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Posting…' : 'Post Update'}
              </button>
            </form>
          </div>
        )}

        {/* ── Update History ── */}
        <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] shadow-sm p-6">
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
              <ClipboardList className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            </span>
            Update History
            <span className="ml-auto text-xs font-normal text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full border border-[var(--border-light)]">
              {updates.length} {updates.length === 1 ? 'entry' : 'entries'}
            </span>
          </h2>

          {updates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ClipboardList className="w-10 h-10 text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-secondary)]">No updates yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Updates posted by the assigned agent will appear here</p>
            </div>
          ) : (
            <div className="space-y-0">
              {updates.map((update, idx) => (
                <div key={update.id} className="flex gap-4 group">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-[var(--primary-100)] border-2 border-[var(--bg-primary)] flex items-center justify-center text-base shrink-0 z-10 shadow-sm">
                      {stageIcon(update.stage)}
                    </div>
                    {idx < updates.length - 1 && (
                      <div className="w-px flex-1 bg-[var(--border-light)] my-1" />
                    )}
                  </div>

                  {/* Update Content */}
                  <div className={`flex-1 pb-5 ${idx === 0 ? '' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {update.agent_name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary-100)] text-[var(--primary-700)] font-medium capitalize">
                          → {update.stage}
                        </span>
                      </div>
                      <time className="text-xs text-[var(--text-muted)]">
                        {formatDate(update.created_at)}
                      </time>
                    </div>
                    {update.notes && (
                      <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-xl px-4 py-3 border border-[var(--border-light)] leading-relaxed">
                        {update.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </SidebarLayout>
  );
};

export default FieldDetail;
