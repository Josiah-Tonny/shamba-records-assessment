import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  MapPin, Sprout, AlertTriangle, CheckCircle,
  Plus, Users, Search, Filter, X, ChevronDown
} from 'lucide-react';
import SidebarLayout from '../components/layout/SidebarLayout';
import FieldCard from '../components/fields/FieldCard';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const normalizeStatus = (status) =>
    String(status || '').trim().toLowerCase().replace(/\s+/g, '_');

  const [fields, setFields]       = useState([]);
  const [agents, setAgents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData]   = useState({
    name: '', crop_type: '', planting_date: '', assigned_to: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fieldsRes, agentsRes] = await Promise.all([
        api.get('/fields'),
        api.get('/auth/agents'),
      ]);
      setFields(fieldsRes.data.data.fields);
      setAgents(agentsRes.data.data.agents || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateField = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fields', formData);
      setFormData({ name: '', crop_type: '', planting_date: '', assigned_to: '' });
      setShowForm(false);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create field');
    }
  };

  const filteredFields = fields.filter((field) => {
    const matchesSearch =
      field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.crop_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || normalizeStatus(field.status) === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total:     fields.length,
    active:    fields.filter(f => normalizeStatus(f.status) === 'active').length,
    atRisk:    fields.filter(f => normalizeStatus(f.status) === 'at_risk').length,
    completed: fields.filter(f => normalizeStatus(f.status) === 'completed').length,
  };

  const isDashboardView = currentPath === '/admin/dashboard';
  const isFieldsView    = currentPath === '/admin/fields';
  const isAgentsView    = currentPath === '/admin/agents';

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          {isDashboardView && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Manage fields and monitor agricultural activities
              </p>
            </>
          )}
          {isFieldsView && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                All Fields
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                View and manage all agricultural fields
              </p>
            </>
          )}
          {isAgentsView && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Agents Directory
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Manage all field agents
              </p>
            </>
          )}
        </div>

        {(isDashboardView || isFieldsView) && (
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'secondary' : 'primary'}
            className="flex items-center gap-2 shrink-0"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Create New Field'}
          </Button>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-[var(--error-50)] border border-[var(--error-200)]">
          <AlertTriangle className="w-5 h-5 text-[var(--error-600)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--error-700)]">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-[var(--error-400)] hover:text-[var(--error-600)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Stats Grid ── */}
      {isDashboardView && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Fields"    value={stats.total}     icon={MapPin}        variant="primary" />
          <StatCard title="Active Growing"  value={stats.active}    icon={Sprout}        variant="success" />
          <StatCard title="At Risk"         value={stats.atRisk}    icon={AlertTriangle} variant="warning" />
          <StatCard title="Completed"       value={stats.completed} icon={CheckCircle}   variant="default" />
        </div>
      )}

      {/* ── Create Field Form ── */}
      {showForm && (isDashboardView || isFieldsView) && (
        <Card className="mb-8 border-[var(--primary-200)] shadow-sm" padding="lg">
          <CardHeader className="pb-4 mb-6 border-b border-[var(--border-light)]">
            <CardTitle className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[var(--primary-100)] flex items-center justify-center">
                <Plus className="w-4 h-4 text-[var(--primary-600)]" />
              </span>
              Create New Field
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateField} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Field Name"
                placeholder="e.g., North Valley Field"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Crop Type"
                placeholder="e.g., Maize, Beans, Coffee"
                required
                value={formData.crop_type}
                onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
              />
              <Input
                label="Planting Date"
                type="date"
                required
                value={formData.planting_date}
                onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-primary)]">
                  Assign to Agent
                </label>
                <div className="relative">
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-[var(--border-default)]
                               bg-[var(--bg-primary)] text-[var(--text-primary)]
                               focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]
                               transition-colors text-sm"
                  >
                    <option value="">Select an agent</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                </div>
              </div>
              <div className="md:col-span-2 flex gap-3 pt-2">
                <Button type="submit" variant="success" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Create Field
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Fields View ── */}
      {(isDashboardView || isFieldsView) && (
        <>
          {/* Search & Filter Bar */}
          <Card className="mb-5" padding="md">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search by field name or crop type…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--border-default)]
                             bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm
                             placeholder:text-[var(--text-muted)]
                             focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]
                             transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-[var(--text-muted)]" />
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-[var(--border-default)]
                               bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm
                               focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]
                               transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="at_risk">At Risk</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                </div>
              </div>
            </div>
          </Card>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Fields List</h2>
            <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-full border border-[var(--border-light)]">
              {filteredFields.length} / {fields.length} fields
            </span>
          </div>

          {filteredFields.length === 0 ? (
            <Card className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                No fields found
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first field'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFields.map((field) => (
                <FieldCard key={field.id} field={field} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Agents View ── */}
      {isAgentsView && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-light)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">All Agents</h2>
            <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-full border border-[var(--border-light)]">
              {agents.length} total
            </span>
          </div>

          {agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-[var(--text-muted)]" />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">No agents found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-light)]
                             bg-[var(--bg-secondary)] hover:border-[var(--primary-300)]
                             hover:bg-[var(--primary-50)] transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-100)] flex items-center justify-center shrink-0 group-hover:bg-[var(--primary-200)] transition-colors">
                    <Users className="w-5 h-5 text-[var(--primary-600)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {agent.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                      {agent.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

    </SidebarLayout>
  );
};

export default AdminDashboard;
