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
      <div className="flex flex-col h-full overflow-hidden">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between shrink-0 animate-fade-in stagger-1">
        <div>
          {isDashboardView && (
            <>
              <h1 className="text-2xl font-bold text-primary tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-sm text-secondary mt-1">
                Manage fields and monitor agricultural activities
              </p>
            </>
          )}
          {isFieldsView && (
            <>
              <h1 className="text-2xl font-bold text-primary tracking-tight">
                All Fields
              </h1>
              <p className="text-sm text-secondary mt-1">
                View and manage all agricultural fields
              </p>
            </>
          )}
          {isAgentsView && (
            <>
              <h1 className="text-2xl font-bold text-primary tracking-tight">
                Agents Directory
              </h1>
              <p className="text-sm text-secondary mt-1">
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
        <div className="mb-4 flex items-start gap-3 p-3 rounded-lg bg-error-50 border border-error-200 shrink-0 animate-shake">
          <AlertTriangle className="w-4 h-4 text-error-600 shrink-0 mt-0.5" />
          <p className="text-sm text-error-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-error-400 hover:text-error-600 transition-all duration-fast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Stats Grid ── */}
      {isDashboardView && (
        <div className="grid grid-cols-2 gap-3 mb-4 lg:grid-cols-4 shrink-0 animate-fade-in stagger-2">
          <StatCard title="Total Fields"    value={stats.total}     icon={MapPin}        variant="primary" />
          <StatCard title="Active Growing"  value={stats.active}    icon={Sprout}        variant="success" />
          <StatCard title="At Risk"         value={stats.atRisk}    icon={AlertTriangle} variant="warning" />
          <StatCard title="Completed"       value={stats.completed} icon={CheckCircle}   variant="default" />
        </div>
      )}

      {/* ── Create Field Form ── */}
      {showForm && (isDashboardView || isFieldsView) && (
        <Card className="mb-4 border-primary-200 shadow-sm shrink-0 animate-scale-in" padding="md">
          <CardHeader className="pb-3 mb-4 border-b border-light">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-primary-600" />
              </span>
              Create New Field
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateField} className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <label className="block text-sm font-medium mb-1.5 text-primary">
                  Assign to Agent
                </label>
                <div className="relative">
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-default
                               bg-primary text-primary
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                               transition-all duration-fast text-sm"
                  >
                    <option value="">Select an agent</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                </div>
              </div>
              <div className="flex gap-3 pt-1 md:col-span-2">
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
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden animate-fade-in stagger-3">
          {/* Search & Filter Bar */}
          <Card className="mb-3 shrink-0" padding="sm">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search by field name or crop type…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-default
                             bg-primary text-primary text-sm
                             placeholder:text-muted
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                             transition-all duration-fast"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-all duration-fast"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-muted" />
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-default
                               bg-primary text-primary text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500
                               transition-all duration-fast"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="at_risk">At Risk</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                </div>
              </div>
            </div>
          </Card>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm font-semibold text-primary">Fields List</h2>
            <span className="text-xs text-secondary bg-secondary px-2 py-0.5 rounded-full border border-light">
              {filteredFields.length} / {fields.length} fields
            </span>
          </div>

          {filteredFields.length === 0 ? (
            <Card className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4 animate-float">
                <MapPin className="w-8 h-8 text-muted" />
              </div>
              <h3 className="text-base font-semibold text-primary mb-2">
                No fields found
              </h3>
              <p className="text-sm text-secondary max-w-xs mx-auto mb-4">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first field'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Button
                  onClick={() => setShowForm(true)}
                  variant="primary"
                  size="sm"
                  className="mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Field
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid content-start flex-1 grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
              {filteredFields.map((field, index) => (
                <div key={field.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-up">
                  <FieldCard field={field} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Agents View ── */}
      {isAgentsView && (
        <Card padding="md" className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-light shrink-0">
            <h2 className="text-sm font-semibold text-primary">All Agents</h2>
            <span className="text-xs text-secondary bg-secondary px-2 py-0.5 rounded-full border border-light">
              {agents.length} total
            </span>
          </div>

          {agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 animate-float">
                <Users className="w-8 h-8 text-muted" />
              </div>
              <h3 className="text-base font-semibold text-primary mb-2">
                No agents found
              </h3>
              <p className="text-sm text-secondary max-w-xs mx-auto">
                Agents will appear here once registered
              </p>
            </div>
          ) : (
            <div className="grid content-start flex-1 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-light
                             bg-secondary hover:border-primary-300
                             hover:bg-primary-50 transition-all duration-fast group animate-slide-up"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0 group-hover:bg-primary-200 transition-colors">
                    <Users className="w-4.5 h-4.5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate">
                      {agent.name}
                    </p>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {agent.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      </div>
    </SidebarLayout>
  );
};

export default AdminDashboard;
