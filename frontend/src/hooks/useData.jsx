import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useFetchData = (endpoint, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(endpoint, { params });
      setData(response.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (endpoint) {
      fetchData();
    }
  }, [endpoint, JSON.stringify(params)]);

  return { data, loading, error, refetch: fetchData };
};

export const useSubmitForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitForm = async (method, endpoint, data, isFormData = false) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const config = isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};

      let response;
      if (method === 'POST') {
        response = await api.post(endpoint, data, config);
      } else if (method === 'PUT') {
        response = await api.put(endpoint, data, config);
      } else if (method === 'PATCH') {
        response = await api.patch(endpoint, data, config);
      } else if (method === 'DELETE') {
        response = await api.delete(endpoint);
      }

      setSuccess(true);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err.response?.data?.error || 'Operation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage, details: err.response?.data };
    } finally {
      setLoading(false);
    }
  };

  return { submitForm, loading, error, success };
};
