import { useState, useEffect } from 'react';
import { sessionAPI } from '../api/axios';

const SessionManager = ({ initialOpenForm = false, actionTrigger, quickAction }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [search, setSearch] = useState('');
  const [countdownTick, setCountdownTick] = useState(0);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 dark:text-gray-100">Academic Sessions</h2>
          <p className="text-sm text-gray-400">Manage sessions, release dates and visibility</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search session by name..."
              className="w-full sm:w-64 px-4 py-2 rounded-3xl bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <span className="absolute right-3 top-2.5 text-gray-500">🔎</span>
          </div>
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

      {/* Sessions List */}
  <div className="bg-gray-900/70 dark:bg-gray-900/70 rounded-xl shadow-lg border border-gray-800 dark:border-gray-800 mx-auto max-w-2xl w-full mt-4 py-6 px-2 sm:px-6 transition-all duration-300" style={{maxHeight: '70vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#374151 #111827'}}>
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-gray-400 text-lg">No academic sessions found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Create your first session to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 dark:divide-gray-800">
              <thead className="bg-gray-800/50 dark:bg-gray-800/50 sticky top-0 z-10">
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
                {filteredSessions.map((session) => (
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
                        {session.current_term === 'first'
                          ? '1st Term'
                          : session.current_term === 'second'
                          ? '2nd Term'
                          : session.current_term === 'third'
                          ? '3rd Term'
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {session.is_active ? (
                          <span className="text-green-400 dark:text-green-400 font-semibold">● Active</span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-500">○ Inactive</span>
                        )}
                        <button
                          onClick={() => handleToggleActive(session)}
                          className="ml-2 text-xs px-2 py-1 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800"
                          title={session.is_active ? 'Unset active' : 'Set as active'}
                        >
                          {session.is_active ? 'Unset' : 'Set Active'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300 dark:text-gray-300">
                      {session.result_release_date ? (
                        <div className="space-y-1">
                          <div className="break-words">{new Date(session.result_release_date).toLocaleString()}</div>
                          {isReleased(session) ? (
                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                              ✅ Released{session.results_unlocked ? ' (Unlocked)' : ''}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              🔒 Locked {timeLeft(session) && <span className="text-[11px] opacity-80">• {timeLeft(session)}</span>}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-gray-500 dark:text-gray-500">Not set</span>
                          {session.results_unlocked && (
                            <span className="block text-green-400 text-xs">Unlocked</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(session)}
                        disabled={deleting === session.id}
                        className="text-blue-400 hover:text-blue-300 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        className="text-yellow-400 hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={session.results_unlocked ? 'Lock results' : 'Unlock results now'}
                      >
                        {session.results_unlocked ? 'Lock Results' : 'Unlock Now'}
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
                      <button
                        onClick={() => setDetailsModal(session)}
                        className="text-purple-400 hover:text-purple-300 dark:text-purple-400 dark:hover:text-purple-300 transition-colors border border-purple-500/30 rounded-2xl px-3 py-1 text-xs font-semibold"
                      >
                        More Details
                      </button>
  // Modal state for details
  const [detailsModal, setDetailsModal] = useState(null);
      {/* Details Modal */}
      {detailsModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/60 flex items-center justify-center z-50 p-2">
          <div className="bg-gray-900/95 dark:bg-gray-900/95 rounded-xl shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto border border-gray-800 dark:border-gray-800 transition-all duration-300 p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-100 dark:text-gray-100">Session Details</h3>
            <div className="space-y-3">
              <div><span className="font-semibold text-gray-300">Name:</span> <span className="text-gray-100">{detailsModal.name}</span></div>
              <div><span className="font-semibold text-gray-300">Start Date:</span> <span className="text-gray-100">{new Date(detailsModal.start_date).toLocaleDateString()}</span></div>
              <div><span className="font-semibold text-gray-300">End Date:</span> <span className="text-gray-100">{new Date(detailsModal.end_date).toLocaleDateString()}</span></div>
              <div><span className="font-semibold text-gray-300">Current Term:</span> <span className="text-gray-100">{detailsModal.current_term}</span></div>
              <div><span className="font-semibold text-gray-300">Result Release Date:</span> <span className="text-gray-100">{detailsModal.result_release_date ? new Date(detailsModal.result_release_date).toLocaleString() : 'Not set'}</span></div>
              <div><span className="font-semibold text-gray-300">Is Active:</span> <span className="text-gray-100">{detailsModal.is_active ? 'Yes' : 'No'}</span></div>
              <div><span className="font-semibold text-gray-300">Results Unlocked:</span> <span className="text-gray-100">{detailsModal.results_unlocked ? 'Yes' : 'No'}</span></div>
              {/* Unlock/Lock Results button removed from modal for clarity */}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setDetailsModal(null)}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-6 py-2 rounded-2xl font-semibold border border-purple-500/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
