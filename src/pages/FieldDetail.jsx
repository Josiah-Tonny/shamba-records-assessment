import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import FieldStatusBadge from '../components/fields/FieldStatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
        axios.get(`/api/fields/${id}`),
        axios.get(`/api/fields/${id}/updates`)
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
      await axios.post(`/api/fields/${id}/updates`, {
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
  if (error) return <div className="text-red-600 text-center mt-8">{error}</div>;
  if (!field) return <div className="text-center mt-8">Field not found</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isAssignedAgent = user?.id === field.assigned_to;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-indigo-600 hover:text-indigo-800 mb-6"
      >
        ← Back to Dashboard
      </button>

      {/* Field Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{field.name}</h1>
            <p className="text-gray-500 mt-1">{field.crop_type}</p>
          </div>
          <FieldStatusBadge status={field.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Planting Date:</span>
            <p className="text-gray-600">{formatDate(field.planting_date)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Current Stage:</span>
            <p className="text-gray-600">{field.stage.charAt(0).toUpperCase() + field.stage.slice(1)}</p>
          </div>
          {field.assigned_to_name && (
            <div>
              <span className="font-medium text-gray-700">Assigned Agent:</span>
              <p className="text-gray-600">{field.assigned_to_name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Agent Update Form */}
      {isAssignedAgent && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Post Update</h2>
          <form onSubmit={handlePostUpdate}>
            <div className="mb-4">
              <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
                Field Stage
              </label>
              <select
                id="stage"
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="planted">Planted</option>
                <option value="growing">Growing</option>
                <option value="ready">Ready</option>
                <option value="harvested">Harvested</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add observations or notes..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Update'}
            </button>
          </form>
        </div>
      )}

      {/* Update History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Update History</h2>
        {updates.length === 0 ? (
          <p className="text-gray-500">No updates yet</p>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="border-l-4 border-indigo-600 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{update.agent_name}</p>
                    <p className="text-sm text-gray-500">Updated to: {update.stage}</p>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(update.created_at)}</p>
                </div>
                {update.notes && (
                  <p className="text-gray-700 text-sm">{update.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldDetail;