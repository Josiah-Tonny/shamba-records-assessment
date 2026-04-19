import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook for fetching agent data (fields and updates)
 * Handles loading states, error handling, and retry logic
 * 
 * @returns {Object} Data fetching state and methods
 */
export const useAgentData = () => {
  const [fields, setFields] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (retryCount = 0) => {
    try {
      setLoading(true);
      
      const fieldsRes = await api.get('/fields/mine');
      const fetchedFields = fieldsRes.data.data.fields;
      setFields(fetchedFields);

      // Fetch recent updates for all assigned fields in parallel
      const results = await Promise.allSettled(
        fetchedFields.map((field) =>
          api.get(`/fields/${field.id}/updates`).then((res) =>
            (res.data.data.updates || []).map((u) => ({
              ...u,
              field_name: field.name,
            }))
          )
        )
      );

      const allUpdates = results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setUpdates(allUpdates);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to load data';
      setError(errorMessage);
      
      // Log error with context for debugging
      console.error('Agent data fetch failed:', {
        message: errorMessage,
        retryCount,
        timestamp: new Date().toISOString()
      });
      
      // Auto-retry once on network errors
      if (retryCount === 0 && !err.response) {
        console.log('Retrying data fetch...');
        setTimeout(() => fetchData(1), 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    setError(null);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    fields,
    updates,
    loading,
    error,
    retry
  };
};
