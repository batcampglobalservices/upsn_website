import { useState, useEffect } from 'react';
import { sessionAPI } from '../api/axios';

const SessionManager = ({ initialOpenForm = false, actionTrigger, quickAction }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [search, setSearch] = useState('');
  const [countdownTick, setCountdownTick] = useState(0);
  const [detailsModal, setDetailsModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    result_release_date: '',
    current_term: 'first',
    results_unlocked: false,
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  // Re-render every second for live countdowns
  useEffect(() => {
    const id = setInterval(() => setCountdownTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (actionTrigger !== undefined) {
      setShowForm(initialOpenForm);
      if (initialOpenForm) {
        setEditingSession(null);
        setFormData({
          name: '',
          start_date: '',
          end_date: '',
          is_active: false,
          result_release_date: quickAction === 'set-release' ? new Date().toISOString().slice(0, 16) : '',
          current_term: 'first',
          results_unlocked: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionTrigger]);

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
        results_unlocked: false,
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
      results_unlocked: !!session.results_unlocked,
    });
    setShowForm(true);
  };

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
      results_unlocked: false,
    });
  };

  const handleToggleActive = async (session) => {
    try {
      // Optimistic UI update
      setSessions((prev) => prev.map((s) => s.id === session.id ? { ...s, is_active: !session.is_active } : s));
      const updated = await sessionAPI.updateSession(session.id, { is_active: !session.is_active });
      // Ensure server truth
      setSessions((prev) => prev.map((s) => s.id === session.id ? { ...s, ...updated.data } : s));
    } catch (error) {
      console.error('Failed to toggle active state', error);
      alert('Failed to toggle active state. There might already be an active session.');
      // Revert
      fetchSessions();
    }
  };

  const isReleased = (session) => {
    if (session?.results_unlocked) return true;
    if (!session?.result_release_date) return true;
    return new Date() >= new Date(session.result_release_date);
  };

  const timeLeft = (session) => {
    if (!session?.result_release_date || session?.results_unlocked) return '';
    const target = new Date(session.result_release_date).getTime();
    const diff = Math.max(0, target - Date.now());
    if (diff === 0) return '';
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const filteredSessions = sessions.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header with Search and Actions */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-6 border border-gray-800/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Academic Sessions
            </h2>
            <p className="text-sm text-gray-400 mt-1">Manage sessions, release dates, and visibility</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sessions..."
                className="w-full sm:w-64 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <span className="absolute right-3 top-2.5 text-blue-400">🔎</span>
            </div>
            <button
              onClick={fetchSessions}
              disabled={loading}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-5 py-2 rounded-xl font-semibold border border-gray-700 transition-all disabled:opacity-60"
              title="Refresh session list"
            >
              ⟳ Refresh
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
            >
              + Add Session
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-gray-900/95 dark:bg-gray-900/95 rounded-xl shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto border border-gray-800 dark:border-gray-800 transition-all duration-300">
            <div className="p-4 sm:p-6">
              <h3 className="text-2xl font-bold mb-6 text-gray-100 dark:text-gray-100">
                {editingSession ? 'Edit Academic Session' : 'Create New Academic Session'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Session Name */}
                <div className="md:col-span-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-400 text-lg font-semibold">No academic sessions found</p>
          <p className="text-gray-500 mt-2">Create your first session to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-blue-500/30 transition-all shadow-lg hover:shadow-blue-500/10"
            >
              {/* Session Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-100 mb-1">{session.name}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(session.start_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
                  </p>
                </div>
                {session.is_active && (
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    ● ACTIVE
                  </span>
                )}
              </div>

              {/* Session Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Term:</span>
                  <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                    {session.current_term === 'first' ? '1st Term' : session.current_term === 'second' ? '2nd Term' : '3rd Term'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Status:</span>
                  <button
                    onClick={() => handleToggleActive(session)}
                    className="px-3 py-1 text-xs rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                    title={session.is_active ? 'Unset active' : 'Set as active'}
                  >
                    {session.is_active ? '○ Set Inactive' : '● Set Active'}
                  </button>
                </div>

                {session.result_release_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Results:</span>
                    {isReleased(session) ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30 font-semibold">
                        ✅ Released
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
                        🔒 {timeLeft(session)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800">
                <button
                  onClick={() => handleEdit(session)}
                  disabled={deleting === session.id}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-semibold transition-all border border-blue-500/30 disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (session.results_unlocked) {
                        const res = await sessionAPI.lockResults(session.id);
                        setSessions(prev => prev.map(s => s.id === session.id ? { ...s, ...res.data.session } : s));
                      } else {
                        const res = await sessionAPI.unlockResults(session.id);
                        setSessions(prev => prev.map(s => s.id === session.id ? { ...s, ...res.data.session } : s));
                      }
                    } catch (e) {
                      console.error('Toggle unlock failed', e);
                      alert('Failed to toggle results lock.');
                    }
                  }}
                  disabled={deleting === session.id}
                  className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg font-semibold transition-all border border-yellow-500/30 disabled:opacity-50"
                  title={session.results_unlocked ? 'Lock results' : 'Unlock results now'}
                >
                  {session.results_unlocked ? '🔓 Lock' : '🔒 Unlock'}
                </button>
                <button
                  onClick={() => setDetailsModal(session)}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-lg font-semibold transition-all border border-purple-500/30"
                >
                  Details
                </button>
                <button
                  onClick={() => handleDelete(session.id)}
                  disabled={deleting === session.id}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-semibold transition-all border border-red-500/30 disabled:opacity-50"
                >
                  {deleting === session.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {detailsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Session Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Session Name</span>
                  <span className="text-gray-100 font-semibold">{detailsModal.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Current Term</span>
                  <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 inline-block">
                    {detailsModal.current_term === 'first' ? '1st Term' : detailsModal.current_term === 'second' ? '2nd Term' : '3rd Term'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Start Date</span>
                  <span className="text-gray-100">{new Date(detailsModal.start_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm block mb-1">End Date</span>
                  <span className="text-gray-100">{new Date(detailsModal.end_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 text-sm block mb-1">Result Release Date</span>
                <span className="text-gray-100">
                  {detailsModal.result_release_date ? new Date(detailsModal.result_release_date).toLocaleString() : 'Not set'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Active Status</span>
                  {detailsModal.is_active ? (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-400 border border-green-500/30 inline-block">
                      ● ACTIVE
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-700/50 text-gray-400 border border-gray-700 inline-block">
                      ○ Inactive
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Results Unlocked</span>
                  {detailsModal.results_unlocked ? (
                    <span className="text-green-400 font-semibold">✅ Yes</span>
                  ) : (
                    <span className="text-gray-500">❌ No</span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setDetailsModal(null)}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-2 rounded-xl font-semibold transition-all shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;
