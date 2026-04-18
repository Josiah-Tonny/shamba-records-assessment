import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FieldCard from '../components/fields/FieldCard';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const [fields, setFields] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    crop_type: '',
    planting_date: '',
    assigned_to: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const fieldsRes = await axios.get('/api/fields');
      setFields(fieldsRes.data.data.fields);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/fields', formData);
      setFormData({ name: '', crop_type: '', planting_date: '', assigned_to: '' });
      setShowForm(false);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create field');
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalFields = fields.length;
  const activeFields = fields.filter(f => f.status === 'Active').length;
  const atRiskFields = fields.filter(f => f.status === 'At Risk').length;
  const completedFields = fields.filter(f => f.status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Fields" value={totalFields} icon="🌾" />
        <StatCard title="Active" value={activeFields} icon="🌱" />
        <StatCard title="At Risk" value={atRiskFields} icon="⚠️" />
        <StatCard title="Completed" value={completedFields} icon="✓" />
      </div>

      {/* Create Field Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Create New Field'}
        </button>

        {showForm && (
          <form onSubmit={handleCreateField} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop Type
              </label>
              <input
                type="text"
                required
                value={formData.crop_type}
                onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Planting Date
              </label>
              <input
                type="date"
                required
                value={formData.planting_date}
                onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Create Field
            </button>
          </form>
        )}
      </div>

      {/* Fields Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Fields</h2>
        {fields.length === 0 ? (
          <p className="text-gray-500">No fields yet</p>
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

export default AdminDashboard;