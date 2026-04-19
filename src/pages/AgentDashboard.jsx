import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
  MapPin, 
  Sprout, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  User,
  Calendar
} from 'lucide-react';
import SidebarLayout from '../components/layout/SidebarLayout';
import FieldCard from '../components/fields/FieldCard';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';

const AgentDashboard = () => {
  const normalizeStatus = (status) => String(status || '').trim().toLowerCase().replace(/\s+/g, '_');
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [fields, setFields] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const fieldsRes = await api.get('/fields/mine');
      setFields(fieldsRes.data.data.fields);
      // Derive recent activity from field data
      const allUpdates = [];
      for (const field of fieldsRes.data.data.fields) {
        try {
          const updatesRes = await api.get(`/fields/${field.id}/updates`);
          if (updatesRes.data.data.updates) {
            allUpdates.push(...updatesRes.data.data.updates.map(u => ({ ...u, field_name: field.name })));
          }
        } catch (err) {
          // Ignore errors for individual fields
          console.warn(`Failed to fetch updates for field ${field.id}`);
        }
      }
      // Sort by date descending
      setUpdates(allUpdates.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFields = fields.filter(field => 
    field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.crop_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: fields.length,
    active: fields.filter(f => normalizeStatus(f.status) === 'active').length,
    atRisk: fields.filter(f => normalizeStatus(f.status) === 'at_risk').length,
    completed: fields.filter(f => normalizeStatus(f.status) === 'completed').length,
  };

  const recentActivity = updates.slice(0, 5);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </SidebarLayout>
    );
  }

  // View flags
  const isDashboardView = currentPath === '/agent/dashboard';
  const isFieldsView = currentPath === '/agent/fields';
  const isUpdatesView = currentPath === '/agent/updates';

  return (
    <SidebarLayout>
      {/* Header */}
      <div className="mb-8">
        {(isDashboardView || isUpdatesView) && (
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[var(--primary-100)] flex items-center justify-center">
              <User className="w-6 h-6 text-[var(--primary-600)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Welcome, {user?.name}!
              </h1>
              <p className="text-[var(--text-secondary)]">
                Field Agent • Manage your assigned fields and updates
              </p>
            </div>
          </div>
        )}
        
        {isFieldsView && (
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Fields</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage and track your assigned fields</p>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-[var(--error-50)] border border-[var(--error-200)] text-[var(--error-700)]">
          {error}
        </div>
      )}

      {/* Stats Grid - Shared */}
      {isDashboardView && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="My Fields" value={stats.total} icon={MapPin} variant="primary" />
          <StatCard title="Active Growing" value={stats.active} icon={Sprout} variant="success" />
          <StatCard title="Need Attention" value={stats.atRisk} icon={AlertTriangle} variant={stats.atRisk > 0 ? 'warning' : 'default'} />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle} variant="default" />
        </div>
      )}

      {/* Dynamic Grid Layout */}
      <div className={(isDashboardView || isUpdatesView) ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : ""}>
        {/* Main Content - Fields Component */}
        {(!isUpdatesView || isDashboardView) && (
          <div className={isDashboardView ? "lg:col-span-2" : ""}>
            <Card className="mb-4" padding="md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search your fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
            </Card>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                My Assigned Fields
              </h2>
              <Badge variant="primary" size="md">
                {filteredFields.length} fields
              </Badge>
            </div>

            {filteredFields.length === 0 ? (
              <Card className="text-center py-12">
                <MapPin className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                  No fields assigned
                </h3>
                <p className="text-[var(--text-secondary)]">
                  {searchQuery ? 'No fields match your search' : 'You don\'t have any fields assigned yet. Contact your admin.'}
                </p>
              </Card>
            ) : (
              <div className={`grid grid-cols-1 ${isDashboardView ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'} gap-4`}>
                {filteredFields.map((field) => (
                  <FieldCard key={field.id} field={field} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sidebar Components Layer */}
        {(isDashboardView || isUpdatesView) && (
          <div>
            <Card>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--border-light)]">
                <Calendar className="w-5 h-5 text-[var(--primary-600)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">Recent Activity</h3>
              </div>
              
              {recentActivity.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                  No recent updates. Start by updating your fields!
                </p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((update, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--primary-500)] mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[var(--text-primary)]">
                          <span className="font-medium">{update.field_name}</span>
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                          Stage changed to <Badge variant="success" size="sm">{update.stage}</Badge>
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {new Date(update.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            {isDashboardView && (
              <Card className="mt-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => navigate('/agent/fields')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--earth-100)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    📝 Submit Field Update
                  </button>
                  <button 
                    onClick={() => navigate('/agent/fields')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--earth-100)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    📍 View All My Fields
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