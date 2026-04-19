import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import FieldStatusBadge from '../components/fields/FieldStatusBadge';
import GrowthProgress from '../components/fields/GrowthProgress';
import FieldUpdateCard from '../components/fields/FieldUpdateCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SidebarLayout from '../components/layout/SidebarLayout';
import { stageIcon, capitalize } from '../utils/fieldUtils';
import { formatDate } from '../utils/dateUtils';
import {
  ArrowLeft, CalendarDays, Sprout, User,
  ClipboardList, ChevronDown, AlertTriangle, Send
} from 'lucide-react';

const STAGES = ['planted', 'growing', 'ready', 'harvested'];

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
          <div className="flex items-start gap-3 p-4 rounded-xl bg-error-50 border border-error-200 animate-shake">
            <AlertTriangle className="w-5 h-5 text-error-600 shrink-0 mt-0.5" />
            <p className="text-sm text-error-700">{error}</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!field) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto py-8 px-4 text-center text-secondary">
          Field not found
        </div>
      </SidebarLayout>
    );
  }

  const isAssignedAgent = user?.id === field.assigned_to;

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto py-6 px-4 animate-fade-in stagger-1">

        {/* ── Back Button ── */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-primary-600
                     hover:text-primary-800 mb-6 transition-all duration-fast group"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          Back to Dashboard
        </button>

        {/* ── Error Banner (non-fatal, e.g. failed to post update) ── */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-error-50 border border-error-200 animate-shake" role="alert" aria-live="polite">
            <AlertTriangle className="w-5 h-5 text-error-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-error-700">{error}</p>
          </div>
        )}

        {/* ── Field Header Card ── */}
        <div className="bg-primary rounded-2xl border border-light shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary tracking-tight">
                {field.name}
              </h1>
              <p className="text-secondary mt-1 text-sm flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-primary-500" aria-hidden="true" />
                {field.crop_type}
              </p>
            </div>
            <FieldStatusBadge status={field.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Planting Date */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                <CalendarDays className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-muted font-medium uppercase tracking-wide">
                  Planted
                </p>
                <p className="text-sm font-semibold text-primary mt-0.5">
                  {formatDate(field.planting_date)}
                </p>
              </div>
            </div>
            {/* Current Stage */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                <Sprout className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-muted font-medium uppercase tracking-wide">
                  Stage
                </p>
                <p className="text-sm font-semibold text-primary mt-0.5">
                  {stageIcon(field.stage)} {capitalize(field.stage)}
                </p>
              </div>
            </div>
            {/* Assigned Agent */}
            {field.assigned_to_name && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wide">
                    Agent
                  </p>
                  <p className="text-sm font-semibold text-primary mt-0.5">
                    {field.assigned_to_name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stage Progress Bar */}
          <GrowthProgress currentStage={field.stage} />
        </div>

        {/* ── Agent Update Form ── */}
        {isAssignedAgent && (
          <div className="bg-primary rounded-2xl border border-light shadow-sm p-6 mb-6 animate-scale-in">
            <h2 className="text-base font-bold text-primary mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center" aria-hidden="true">
                <Send className="w-3.5 h-3.5 text-primary-600" />
              </span>
              Post an Update
            </h2>

            <form onSubmit={handlePostUpdate} className="space-y-4">
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-primary mb-1.5">
                  Current Stage
                </label>
                <div className="relative">
                  <select
                    id="stage"
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-default
                               bg-primary text-primary text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                               transition-all duration-fast"
                    aria-describedby="stage-help"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {stageIcon(s)} {capitalize(s)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-primary mb-1.5">
                  Observations & Notes
                  <span className="ml-1.5 text-xs font-normal text-muted">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-default
                             bg-primary text-primary text-sm
                             placeholder:text-muted
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                             resize-none transition-all duration-fast"
                  placeholder="Describe current field conditions, observations, or any concerns…"
                  aria-describedby="notes-help"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           bg-primary-600 hover:bg-primary-700 text-white
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-fast shadow-sm active:scale-[0.98]"
                aria-busy={submitting}
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                {submitting ? 'Posting…' : 'Post Update'}
              </button>
            </form>
          </div>
        )}

        {/* ── Update History ── */}
        <div className="bg-primary rounded-2xl border border-light shadow-sm p-6">
          <h2 className="text-base font-bold text-primary mb-5 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center" aria-hidden="true">
              <ClipboardList className="w-3.5 h-3.5 text-secondary" />
            </span>
            Update History
            <span className="ml-auto text-xs font-normal text-muted bg-secondary px-2 py-0.5 rounded-full border border-light" aria-live="polite">
              {updates.length} {updates.length === 1 ? 'entry' : 'entries'}
            </span>
          </h2>

          {updates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 animate-float">
                <ClipboardList className="w-8 h-8 text-muted" aria-hidden="true" />
              </div>
              <p className="text-sm text-secondary">No updates yet</p>
              <p className="text-xs text-muted mt-1">Updates posted by the assigned agent will appear here</p>
            </div>
          ) : (
            <div className="space-y-0" role="list">
              {updates.map((update, idx) => (
                <div key={update.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-slide-up">
                  <FieldUpdateCard
                    update={update}
                    isLast={idx === updates.length - 1}
                    index={idx}
                  />
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
