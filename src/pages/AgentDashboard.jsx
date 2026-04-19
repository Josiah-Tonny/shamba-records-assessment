import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAgentData } from '../hooks/useAgentData';
import { normalizeStatus } from '../utils/fieldUtils';
import { getAgentView } from '../utils/viewUtils';
import {
  MapPin, Sprout, AlertTriangle, CheckCircle,
  Search, User, Calendar, ClipboardList, ArrowRight, X,
  LayoutDashboard, History, Clock, ArrowUpRight
} from 'lucide-react';
import SidebarLayout from '../components/layout/SidebarLayout';
import FieldCard from '../components/fields/FieldCard';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';

const AgentDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [searchQuery, setSearchQuery] = useState('');

  // Use custom hook for data fetching with error handling and retry logic
  const { fields, updates, loading, error, retry } = useAgentData();

  // Determine current view
  const { isDashboardView, isFieldsView, isUpdatesView } = getAgentView(currentPath);

  // Memoize filtered fields to prevent unnecessary recalculations
  const filteredFields = useMemo(
    () =>
      fields.filter(
        (field) =>
          field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          field.crop_type.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [fields, searchQuery]
  );

  // Memoize stats calculation
  const stats = useMemo(
    () => ({
      total: fields.length,
      active: fields.filter((f) => normalizeStatus(f.status) === 'active').length,
      atRisk: fields.filter((f) => normalizeStatus(f.status) === 'at_risk').length,
      completed: fields.filter((f) => normalizeStatus(f.status) === 'completed').length,
    }),
    [fields]
  );

  // Memoize recent activity
  const recentActivity = useMemo(() => updates.slice(0, 5), [updates]);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>

      {/* ── Page Header ── */}
      <div className="mb-10 animate-fade-in stagger-1">
        {(isDashboardView || isUpdatesView) && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-white border-2 border-white shadow-xl shadow-earth-200/50 flex items-center justify-center shrink-0">
                <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-inner">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-primary tracking-tight leading-none">
                  Habari, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-sm font-semibold text-muted tracking-wide uppercase mt-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                  Field Agent · {stats.total} Field{stats.total !== 1 ? 's' : ''} Managed
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-light shadow-sm self-start md:self-auto">
               <div className="px-4 py-2 rounded-xl bg-earth-50 border border-light/50">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Local Time</p>
                  <p className="text-sm font-bold text-primary font-mono">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
               </div>
               <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <Calendar className="w-5 h-5" />
               </div>
            </div>
          </div>
        )}
        {isFieldsView && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight">Active Portfolio</h1>
              <p className="text-sm font-semibold text-muted tracking-wide uppercase mt-1">
                Field Assignments & Status
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-[var(--error-50)] border border-[var(--error-200)]" role="alert" aria-live="polite">
          <AlertTriangle className="w-5 h-5 text-[var(--error-600)] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-[var(--error-700)]">{error}</p>
          <button
            onClick={retry}
            className="ml-auto px-3 py-1.5 text-sm font-medium text-[var(--error-600)] hover:bg-[var(--error-100)] rounded-lg transition-colors"
            aria-label="Retry loading data"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Stats Grid ── */}
      {isDashboardView && (
        <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4 animate-fade-in stagger-2">
          <StatCard title="My Fields"       value={stats.total}     icon={MapPin}        variant="primary" />
          <StatCard title="Active Growing"  value={stats.active}    icon={Sprout}        variant="success" />
          <StatCard
            title="Need Attention"
            value={stats.atRisk}
            icon={AlertTriangle}
            variant={stats.atRisk > 0 ? 'warning' : 'default'}
          />
          <StatCard title="Completed"       value={stats.completed} icon={CheckCircle}   variant="default" />
        </div>
      )}

      {/* ── Main Content Grid ── */}
      <div className={
        (isDashboardView || isUpdatesView)
          ? 'grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in stagger-3'
          : 'animate-fade-in stagger-3'
      }>

        {/* Fields Panel */}
        {!isUpdatesView && (
          <div className={isDashboardView ? 'lg:col-span-2 space-y-4' : 'space-y-4'}>

            {/* Search */}
            <Card padding="md">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search your fields…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-[var(--border-default)]
                             bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm
                             placeholder:text-[var(--text-muted)]
                             focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]
                             transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  aria-label="Search fields"
                  id="field-search"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                My Assigned Fields
              </h2>
              <Badge variant="primary" size="md" aria-live="polite">
                {filteredFields.length} field{filteredFields.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Field Cards */}
            {filteredFields.length === 0 ? (
              <Card className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  No fields found
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
                  {searchQuery
                    ? 'No fields match your search query'
                    : "You don't have any fields assigned yet. Contact your admin."}
                </p>
              </Card>
            ) : (
              <div className={`grid grid-cols-1 gap-4 ${
                isDashboardView
                  ? 'md:grid-cols-2'
                  : 'md:grid-cols-2 xl:grid-cols-3'
              }`}>
                {filteredFields.map((field) => (
                  <FieldCard key={field.id} field={field} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sidebar: Activity + Quick Actions */}
        {(isDashboardView || isUpdatesView) && (
          <div className="space-y-4">

            {/* Recent Activity */}
            <Card className="overflow-hidden border-light shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-light bg-earth-50/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shadow-sm">
                    <ClipboardList className="w-4 h-4 text-primary-600" />
                  </div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Feed Activity</h3>
                </div>
                <Badge variant="primary" size="sm">Live</Badge>
              </div>

              <div className="p-5">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-earth-50 flex items-center justify-center mb-4">
                    <ClipboardList className="w-8 h-8 text-muted/40" />
                  </div>
                  <p className="text-sm font-bold text-primary mb-1">
                    No recent activity
                  </p>
                  <p className="text-xs text-muted font-medium max-w-[180px]">
                    Field updates will appear here as you log them.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-light before:content-['']">
                  {recentActivity.map((update, index) => (
                    <div key={index} className="flex gap-4 relative z-10 group cursor-pointer" onClick={() => navigate(`/fields/${update.field_id}`)}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm transition-transform group-hover:scale-110 ${index === 0 ? 'bg-primary-500 scale-110' : 'bg-earth-200'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-white animate-pulse' : 'bg-earth-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                           <p className="text-xs font-extrabold text-primary uppercase tracking-tight truncate">
                             {update.field_name}
                           </p>
                           <time className="text-[10px] font-bold text-muted tabular-nums">
                             {new Date(update.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                           </time>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Transitioned to</span>
                          <Badge variant={normalizeStatus(update.stage) === 'ready' ? 'success' : 'primary'} size="sm" className="font-bold">
                            {update.stage}
                          </Badge>
                        </div>
                        {update.notes && (
                          <div className="mt-2 text-[11px] text-secondary bg-earth-50 p-2 rounded-lg border border-light/50 line-clamp-2 italic">
                            "{update.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
              
              <div className="px-5 py-3 border-t border-light bg-earth-50/10">
                 <button onClick={() => navigate('/agent/fields')} className="w-full text-[10px] font-extrabold uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors">
                    View Full History
                 </button>
              </div>
            </Card>

            {/* Quick Actions */}
            {isDashboardView && (
              <Card>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => navigate('/agent/fields')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm
                               text-[var(--text-secondary)] hover:bg-[var(--earth-100)] hover:text-[var(--text-primary)]
                               transition-colors group"
                    aria-label="Submit a field update"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base" aria-hidden="true">📝</span>
                      Submit Field Update
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => navigate('/agent/fields')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm
                               text-[var(--text-secondary)] hover:bg-[var(--earth-100)] hover:text-[var(--text-primary)]
                               transition-colors group"
                    aria-label="View all assigned fields"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base" aria-hidden="true">📍</span>
                      View All My Fields
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" aria-hidden="true" />
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

    </SidebarLayout>
  );
};

export default AgentDashboard;
