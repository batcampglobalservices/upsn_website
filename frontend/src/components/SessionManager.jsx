import { useState, useEffect } from 'react';
import { sessionAPI } from '../api/axios';

const SessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    result_release_date: '',
    current_term: 'first',
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await sessionAPI.getSessions();
      setSessions(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      alert('Failed to fetch academic sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return; // Prevent double submission
    
    try {
      setSubmitting(true);
      // Prepare data - remove empty result_release_date
      const submitData = { ...formData };
      if (!submitData.result_release_date) {
        delete submitData.result_release_date;
      }

      if (editingSession) {
        const updated = await sessionAPI.updateSession(editingSession.id, submitData);
        alert('Academic session updated successfully!');
        // Optimistically update in UI
        setSessions((prev) => prev.map((s) => s.id === editingSession.id ? { ...s, ...updated.data } : s));
      } else {
        const created = await sessionAPI.createSession(submitData);
        alert('Academic session created successfully!');
        // Optimistically add to UI
        setSessions((prev) => [...prev, created.data]);
      }

      setShowForm(false);
      setEditingSession(null);
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        is_active: false,
        result_release_date: '',
        current_term: 'first',
      });
      // Optionally re-fetch in background for consistency
      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.detail || 
                       JSON.stringify(error.response?.data) || 
                       'An error occurred';
      alert(`${editingSession ? 'Failed to update session' : 'Failed to create session'}\n\nError: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      start_date: session.start_date,
      end_date: session.end_date,
      is_active: session.is_active,
      result_release_date: session.result_release_date ? 
        new Date(session.result_release_date).toISOString().slice(0, 16) : '',
      current_term: session.current_term || 'first',
    });
    setShowForm(true);
  };

  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this academic session? This will also delete all associated results!')) {
      return;
    }

    try {
      setDeleting(id);
      // Optimistically remove from UI
      setSessions((prev) => prev.filter((s) => s.id !== id));
      await sessionAPI.deleteSession(id);
      alert('Academic session deleted successfully!');
      // Optionally re-fetch in background for consistency
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete academic session');
      // On error, re-fetch to restore state
      fetchSessions();
    } finally {
      setDeleting(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSession(null);
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      is_active: false,
      result_release_date: '',
      current_term: 'first',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-100 dark:text-gray-100">Academic Sessions</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchSessions}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-5 py-2 rounded-3xl font-semibold border border-gray-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            title="Refresh session list"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </span>
            ) : (
              <span>⟳ Refresh</span>
            )}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 dark:text-blue-400 px-6 py-2 rounded-3xl font-semibold transition-all border border-blue-500/30 dark:border-blue-500/30"
          >
            + Add Session
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800 dark:border-gray-800">
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-100 dark:text-gray-100">
                {editingSession ? 'Edit Academic Session' : 'Create New Academic Session'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Session Name */}
                <div>
                  <label className="block text-gray-300 dark:text-gray-300 font-medium mb-2">
                    Session Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., 2024/2025"
                    required
                    className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-400 focus:border-transparent text-gray-100 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-gray-300 dark:text-gray-300 font-medium mb-2">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-400 focus:border-transparent text-gray-100 dark:text-gray-100"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-gray-300 dark:text-gray-300 font-medium mb-2">
                    End Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-400 focus:border-transparent text-gray-100 dark:text-gray-100"
                  />
                </div>

                {/* Current Term */}
                <div>
                  <label className="block text-gray-300 dark:text-gray-300 font-medium mb-2">
                    Current Term <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="current_term"
                    value={formData.current_term}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-400 focus:border-transparent text-gray-100 dark:text-gray-100"
                  >
                    <option value="first">First Term</option>
                    <option value="second">Second Term</option>
                    <option value="third">Third Term</option>
                  </select>
                </div>

                {/* Result Release Date */}
                <div>
                  <label className="block text-gray-300 dark:text-gray-300 font-medium mb-2">
                    Result Release Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="result_release_date"
                    value={formData.result_release_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-400 focus:border-transparent text-gray-100 dark:text-gray-100"
                  />
                  <p className="text-gray-400 dark:text-gray-400 text-sm mt-1">
                    Students can only view results after this date/time
                  </p>
                </div>

                {/* Is Active */}
                <div className="flex items-center space-x-3 p-4 bg-gray-800/50 dark:bg-gray-800/50 rounded-2xl">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-400 bg-gray-700 border-gray-600 rounded focus:ring-blue-400 dark:focus:ring-blue-400"
                  />
                  <label className="text-gray-300 dark:text-gray-300 font-medium">
                    Set as Active Session
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-800 disabled:cursor-not-allowed text-blue-400 dark:text-blue-400 disabled:text-gray-500 py-3 rounded-3xl font-semibold transition-all border border-blue-500/30 dark:border-blue-500/30 disabled:border-gray-700 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingSession ? 'Update Session' : 'Create Session'}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 dark:text-gray-300 py-3 rounded-3xl font-semibold transition-all border border-gray-700 dark:border-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-gray-900/70 dark:bg-gray-900/70 rounded-3xl shadow-lg border border-gray-800 dark:border-gray-800 overflow-hidden">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-gray-400 text-lg">No academic sessions found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Create your first session to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 dark:divide-gray-800">
              <thead className="bg-gray-800/50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Current Term
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Result Release
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 dark:divide-gray-800">
                {sessions.map((session) => (
                  <tr 
                    key={session.id} 
                    className="hover:bg-gray-800/30 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-gray-100 dark:text-gray-100 font-semibold">
                          {session.name}
                        </span>
                        {session.is_active && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300 dark:text-gray-300">
                      {new Date(session.start_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {session.current_term === 'first' ? '1st' : session.current_term === 'second' ? '2nd' : '3rd'} Term
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.is_active ? (
                        <span className="text-green-400 dark:text-green-400 font-semibold">● Active</span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-500">○ Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300 dark:text-gray-300">
                      {session.result_release_date ? (
                        <div>
                          <div>{new Date(session.result_release_date).toLocaleString()}</div>
                          {new Date() >= new Date(session.result_release_date) ? (
                            <span className="text-green-400 dark:text-green-400 text-xs">Released</span>
                          ) : (
                            <span className="text-orange-400 dark:text-orange-400 text-xs">Locked</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-500">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(session)}
                        disabled={deleting === session.id}
                        className="text-blue-400 hover:text-blue-300 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        disabled={deleting === session.id}
                        className="text-red-400 hover:text-red-300 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
                      >
                        {deleting === session.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Deleting...</span>
                          </>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManager;
