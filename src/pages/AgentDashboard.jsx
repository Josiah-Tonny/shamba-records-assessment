import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAgentData } from '../hooks/useAgentData';
import { normalizeStatus } from '../utils/fieldUtils';
import { formatDate } from '../utils/dateUtils';
import { getAgentView } from '../utils/viewUtils';
import {
  MapPin, Sprout, AlertTriangle, CheckCircle,
  Search, User, Calendar, ClipboardList, ArrowRight, X
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
      <div className="mb-8 animate-fade-in stagger-1">
        {(isDashboardView || isUpdatesView) && (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary-100)] flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-[var(--primary-600)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Field Agent · {stats.total} field{stats.total !== 1 ? 's' : ''} assigned
              </p>
            </div>
          </div>
        )}
        {isFieldsView && (
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">My Fields</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Manage and track your assigned fields
            </p>
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
            <Card>
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[var(--border-light)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary-100)] flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[var(--primary-600)]" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Activity</h3>
              </div>

              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <ClipboardList className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    No recent updates
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Start by updating one of your fields
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((update, index) => (
                    <div key={index} className="flex gap-3 group">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-500)] mt-1 shrink-0 group-hover:scale-125 transition-transform" />
                        {index < recentActivity.length - 1 && (
                          <div className="w-px flex-1 bg-[var(--border-light)] mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-3">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {update.field_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-[var(--text-secondary)]">Stage →</span>
                          <Badge variant="success" size="sm">{update.stage}</Badge>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {formatDate(update.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
