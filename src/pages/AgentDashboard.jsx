import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import FieldCard from '../components/fields/FieldCard';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyFields();
  }, []);

  const fetchMyFields = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/fields/mine');
      setFields(res.data.data.fields);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalFields = fields.length;
  const activeFields = fields.filter(f => f.status === 'Active').length;
  const atRiskFields = fields.filter(f => f.status === 'At Risk').length;
  const completedFields = fields.filter(f => f.status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome, {user?.name}!</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard title="My Fields" value={totalFields} icon="🌾" />
        <StatCard title="Active" value={activeFields} icon="🌱" />
        <StatCard title="At Risk" value={atRiskFields} icon="⚠️" />
        <StatCard title="Completed" value={completedFields} icon="✓" />
      </div>

      {/* Fields Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Assigned Fields</h2>
        {fields.length === 0 ? (
          <p className="text-gray-500">No fields assigned yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <FieldCard key={field.id} field={field} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;