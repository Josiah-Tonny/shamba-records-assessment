import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Sprout, AlertTriangle, CheckCircle, Plus, Users, Search, Filter } from 'lucide-react';
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

  const normalizeStatus = (status) => String(status || '').trim().toLowerCase().replace(/\s+/g, '_');
  const [fields, setFields] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    crop_type: '',
    planting_date: '',
    assigned_to: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fieldsRes, agentsRes] = await Promise.all([
        api.get('/fields'),
        api.get('/auth/agents')
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

  useEffect(() => {
    fetchData();
  }, []);

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

  const filteredFields = fields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         field.crop_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || normalizeStatus(field.status) === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: fields.length,
    active: fields.filter(f => normalizeStatus(f.status) === 'active').length,
    atRisk: fields.filter(f => normalizeStatus(f.status) === 'at_risk').length,
    completed: fields.filter(f => normalizeStatus(f.status) === 'completed').length,
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </SidebarLayout>
    );
  }

  // View logic
  const isDashboardView = currentPath === '/admin/dashboard';
  const isFieldsView = currentPath === '/admin/fields';
  const isAgentsView = currentPath === '/admin/agents';

  return (
    <SidebarLayout>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          {isDashboardView && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard Overview</h1>
              <p className="text-[var(--text-secondary)] mt-1">Manage your fields and monitor agricultural activities</p>
            </>
          )}
          {isFieldsView && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">All Fields</h1>
              <p className="text-[var(--text-secondary)] mt-1">View and manage all agricultural fields</p>
            </>
          )}
          {isAgentsView && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Agents Directory</h1>
              <p className="text-[var(--text-secondary)] mt-1">Manage all field agents</p>
            </>
          )}
        </div>
        {(isDashboardView || isFieldsView) && (
          <Button 
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'secondary' : 'primary'}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Create New Field'}
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-[var(--error-50)] border border-[var(--error-200)] text-[var(--error-700)]">
          {error}
        </div>
      )}

      {/* Optional: Dashboard Stats */}
      {isDashboardView && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Fields" value={stats.total} icon={MapPin} variant="primary" />
          <StatCard title="Active Growing" value={stats.active} icon={Sprout} variant="success" />
          <StatCard title="At Risk" value={stats.atRisk} icon={AlertTriangle} variant="warning" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle} variant="default" />
        </div>
      )}

      {/* Create Field Form */}
      {showForm && (isDashboardView || isFieldsView) && (
        <Card className="mb-8" padding="lg">
          <CardHeader>
            <CardTitle>Create New Field</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateField} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Field Name" placeholder="e.g., North Valley Field" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input label="Crop Type" placeholder="e.g., Maize, Beans, Coffee" required value={formData.crop_type} onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })} />
              <Input label="Planting Date" type="date" required value={formData.planting_date} onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })} />
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-primary)]">Assign to Agent</label>
                <select value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <option value="">Select an agent</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" variant="success">Create Field</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Fields View */}
      {(isDashboardView || isFieldsView) && (
        <>
          <Card className="mb-6" padding="md">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input type="text" placeholder="Search fields..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]" style={{ backgroundColor: 'var(--bg-primary)' }} />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[var(--text-muted)]" />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-lg border border-[var(--border-default)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="at_risk">At Risk</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Fields List</h2>
              <span className="text-sm text-[var(--text-secondary)]">Showing {filteredFields.length} of {fields.length} fields</span>
            </div>
            
            {filteredFields.length === 0 ? (
              <Card className="text-center py-12">
                <MapPin className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No fields found</h3>
                <p className="text-[var(--text-secondary)] mb-4">{searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Get started by creating your first field'}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredFields.map((field) => (
                  <FieldCard key={field.id} field={field} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Agents View */}
      {isAgentsView && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">All Agents</h2>
            <span className="text-sm text-[var(--text-secondary)]">{agents.length} Total</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {agents.length === 0 ? (
              <div className="col-span-full text-center py-12 text-[var(--text-muted)]">No agents found</div>
            ) : (
              agents.map(agent => (
                <div key={agent.id} className="p-4 border border-[var(--border-light)] rounded-xl flex items-center gap-4 bg-[var(--bg-secondary)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--primary-100)] flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[var(--primary-600)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--text-primary)] truncate">{agent.name}</p>
                    <p className="text-sm text-[var(--text-muted)] truncate">{agent.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

    </SidebarLayout>
  );
};

export default AdminDashboard;