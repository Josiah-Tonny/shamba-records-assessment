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
  ClipboardList, ChevronDown, AlertTriangle, Send,
  CheckCircle, History
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';

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

  useEffect(() => {
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

    fetchFieldData();
  }, [id]);

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!newStage) return;
    try {
      setSubmitting(true);
      await api.post(`/fields/${id}/updates`, { stage: newStage, notes: newNotes });
      setNewNotes('');
      // Manually trigger a refresh after successful post
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
        <div className="bg-white rounded-3xl border border-light shadow-2xl shadow-primary-900/5 p-8 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sprout className="w-48 h-48 -mr-12 -mt-12" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-1">
                <div className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-[10px] font-extrabold uppercase tracking-widest border border-primary-200/50">
                  {field.crop_type}
                </div>
                <FieldStatusBadge status={field.status} />
              </div>
              <h1 className="text-4xl font-extrabold text-primary tracking-tight">
                {field.name}
              </h1>
              <div className="flex items-center gap-2 text-muted font-bold text-[10px] uppercase tracking-widest">
                <MapPin className="w-3 h-3" />
                Agricultural Sector 4B · Hybrid Management
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-earth-50/50 p-4 rounded-2xl border border-light/50">
               <div className="text-right">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Current Cycle State</p>
                  <p className="text-xl font-black text-primary uppercase tracking-tighter tabular-nums">
                    {stageIcon(field.stage)} {field.stage}
                  </p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            {/* Planting Date */}
            <div className="p-4 rounded-2xl bg-white border border-light shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shadow-inner">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-none mb-1.5">
                  Initial Planting
                </p>
                <p className="text-sm font-black text-primary">
                  {formatDate(field.planting_date)}
                </p>
              </div>
            </div>
            
            {/* Growth Stage */}
            <div className="p-4 rounded-2xl bg-white border border-light shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shadow-inner">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-none mb-1.5">
                  Maturity Phase
                </p>
                <p className="text-sm font-black text-primary">
                  {capitalize(field.stage)} Growth
                </p>
              </div>
            </div>
            
            {/* Assigned Agent */}
            {field.assigned_to_name && (
              <div className="p-4 rounded-2xl bg-white border border-light shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shadow-inner">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-none mb-1.5">
                    Field Custodian
                  </p>
                  <p className="text-sm font-black text-primary">
                    {field.assigned_to_name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stage Progress Bar */}
          <div className="mt-10 px-2">
            <GrowthProgress currentStage={field.stage} />
          </div>
        </div>

        {/* ── Agent Update Form ── */}
        {isAssignedAgent && (
          <Card className="mb-8 border-light shadow-xl shadow-earth-200/40 overflow-hidden" padding="none">
            <div className="bg-earth-100/50 px-6 py-4 border-b border-light flex items-center justify-between">
               <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">Log Site Intervention</h3>
               <Badge variant="primary" size="sm">Active Session</Badge>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handlePostUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted tracking-widest ml-1">Observed Stage</label>
                    <div className="relative">
                      <select
                        id="stage"
                        value={newStage}
                        onChange={(e) => setNewStage(e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 rounded-xl border border-light
                                   bg-white text-primary font-bold text-sm
                                   focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {stageIcon(s)} {capitalize(s)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted tracking-widest ml-1">Field Observations</label>
                    <textarea
                      id="notes"
                      placeholder="Enter detailed observation notes about crop health, soil conditions, or pest levels..."
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-light bg-white text-primary text-sm
                                 min-h-[100px] focus:ring-2 focus:ring-primary-500 transition-all outline-none font-medium"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={submitting} variant="primary" className="px-8 py-3 rounded-xl shadow-lg active:scale-95 transition-all">
                    <span className="font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {submitting ? 'Committing...' : 'Commit Observation'}
                    </span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
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
