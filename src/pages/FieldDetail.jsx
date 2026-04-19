import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import FieldStatusBadge from '../components/fields/FieldStatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SidebarLayout from '../components/layout/SidebarLayout';

const FieldDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [field, setField] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStage, setNewStage] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFieldData();
  }, [id]);

  const fetchFieldData = async () => {
    try {
      setLoading(true);
      const [fieldRes, updatesRes] = await Promise.all([
        api.get(`/fields/${id}`),
        api.get(`/fields/${id}/updates`)
      ]);

      setField(fieldRes.data.data.field);
      setUpdates(updatesRes.data.data.updates);
      setNewStage(fieldRes.data.data.field.stage);
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
      await api.post(`/fields/${id}/updates`, {
        stage: newStage,
        notes: newNotes
      });

      setNewNotes('');
      await fetchFieldData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post update');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-[var(--error-600)] text-center mt-8">{error}</div>;
  if (!field) return <div className="text-center mt-8 text-[var(--text-primary)]">Field not found</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isAssignedAgent = user?.id === field.assigned_to;

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-[var(--primary-600)] hover:text-[var(--primary-800)] mb-6 transition-colors"
      >
        ← Back to Dashboard
      </button>

      {/* Field Header */}
      <div className="bg-[var(--bg-primary)] shadow rounded-xl p-6 border border-[var(--border-light)] mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">{field.name}</h1>
            <p className="text-[var(--text-secondary)] mt-1">{field.crop_type}</p>
          </div>
          <FieldStatusBadge status={field.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mt-6">
          <div>
            <span className="font-medium text-[var(--text-secondary)]">Planting Date:</span>
            <p className="text-[var(--text-primary)]">{formatDate(field.planting_date)}</p>
          </div>
          <div>
            <span className="font-medium text-[var(--text-secondary)]">Current Stage:</span>
            <p className="text-[var(--text-primary)]">{field.stage.charAt(0).toUpperCase() + field.stage.slice(1)}</p>
          </div>
          {field.assigned_to_name && (
            <div>
              <span className="font-medium text-[var(--text-secondary)]">Assigned Agent:</span>
              <p className="text-[var(--text-primary)]">{field.assigned_to_name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Agent Update Form */}
      {isAssignedAgent && (
        <div className="bg-[var(--bg-primary)] shadow rounded-xl p-6 border border-[var(--border-light)] mb-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Post Update</h2>
          <form onSubmit={handlePostUpdate}>
            <div className="mb-4">
              <label htmlFor="stage" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Field Stage
              </label>
              <select
                id="stage"
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
              >
                <option value="planted">Planted</option>
                <option value="growing">Growing</option>
                <option value="ready">Ready</option>
                <option value="harvested">Harvested</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                placeholder="Add observations or notes..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[var(--primary-600)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-700)] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Update'}
            </button>
          </form>
        </div>
      )}

      {/* Update History */}
      <div className="bg-[var(--bg-primary)] shadow rounded-xl p-6 border border-[var(--border-light)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Update History</h2>
        {updates.length === 0 ? (
          <p className="text-[var(--text-secondary)]">No updates yet</p>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="border-l-4 border-[var(--primary-600)] pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{update.agent_name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">Updated to: {update.stage}</p>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{formatDate(update.created_at)}</p>
                </div>
                {update.notes && (
                  <p className="text-[var(--text-primary)] text-sm mt-2">{update.notes}</p>
                )}
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