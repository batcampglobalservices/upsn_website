import { useState, useEffect } from 'react';
import { sessionAPI } from '../api/axios';

const ResultReleaseManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [releaseDate, setReleaseDate] = useState('');
  const [releaseTime, setReleaseTime] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getSessions();
      setSessions(response.data.results || response.data);
      
      // Auto-select active session
      const activeSessions = (response.data.results || response.data).filter(s => s.is_active);
      if (activeSessions.length > 0) {
        setSelectedSession(activeSessions[0]);
        if (activeSessions[0].result_release_date) {
          const releaseDateTime = new Date(activeSessions[0].result_release_date);
          setReleaseDate(releaseDateTime.toISOString().split('T')[0]);
          setReleaseTime(releaseDateTime.toTimeString().slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionChange = (sessionId) => {
    const session = sessions.find(s => s.id === parseInt(sessionId));
    setSelectedSession(session);
    
    if (session && session.result_release_date) {
      const releaseDateTime = new Date(session.result_release_date);
      setReleaseDate(releaseDateTime.toISOString().split('T')[0]);
      setReleaseTime(releaseDateTime.toTimeString().slice(0, 5));
    } else {
      setReleaseDate('');
      setReleaseTime('');
    }
  };

  const handleSaveReleaseDate = async () => {
    if (!selectedSession) {
      alert('Please select a session');
      return;
    }

    if (!releaseDate || !releaseTime) {
      alert('Please select both date and time');
      return;
    }

    try {
      const releaseDateTimeString = `${releaseDate}T${releaseTime}:00`;
      await sessionAPI.updateSession(selectedSession.id, {
        result_release_date: releaseDateTimeString,
      });
      
      alert('Result release date/time set successfully!');
      fetchSessions();
    } catch (error) {
      console.error('Error setting release date:', error);
      alert('Failed to set release date');
    }
  };

  const handleClearReleaseDate = async () => {
    if (!selectedSession) {
      alert('Please select a session');
      return;
    }

    if (!window.confirm('Are you sure you want to remove the result release date? Results will be visible immediately.')) {
      return;
    }

    try {
      await sessionAPI.updateSession(selectedSession.id, {
        result_release_date: null,
      });
      
      alert('Result release date cleared! Results are now visible.');
      setReleaseDate('');
      setReleaseTime('');
      fetchSessions();
    } catch (error) {
      console.error('Error clearing release date:', error);
      alert('Failed to clear release date');
    }
  };

  const isResultsReleased = () => {
    if (!selectedSession || !selectedSession.result_release_date) {
      return true; // No release date set, results are visible
    }
    
    const releaseDateTime = new Date(selectedSession.result_release_date);
    const now = new Date();
    return now >= releaseDateTime;
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Result Release Management</h2>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4">Set Result Release Timer</h3>
        <p className="text-gray-600 mb-4">
          Set a date and time when students can view their results. Before this time, 
          results will be hidden from students with a notification showing the release date.
        </p>

        {loading ? (
          <div className="text-center py-4">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-4 text-gray-600">
            No academic sessions found. Please create a session first.
          </div>
        ) : (
          <>
            {/* Session Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-semibold">
                Select Academic Session
              </label>
              <select
                value={selectedSession?.id || ''}
                onChange={(e) => handleSessionChange(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Select Session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name} {session.is_active && '(Active)'}
                  </option>
                ))}
              </select>
            </div>

            {selectedSession && (
              <>
                {/* Current Status */}
                <div className="mb-6 p-4 border rounded bg-gray-50">
                  <h4 className="font-semibold mb-2">Current Status:</h4>
                  {selectedSession.result_release_date ? (
                    <div>
                      <p className="text-gray-700">
                        Results will be released on:{' '}
                        <span className="font-semibold text-blue-600">
                          {new Date(selectedSession.result_release_date).toLocaleString()}
                        </span>
                      </p>
                      <p className="mt-2">
                        Status:{' '}
                        {isResultsReleased() ? (
                          <span className="text-green-600 font-semibold">
                            ✓ Results are now visible to students
                          </span>
                        ) : (
                          <span className="text-orange-600 font-semibold">
                            🔒 Results are currently hidden from students
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-green-600 font-semibold">
                      ✓ Results are currently visible to students (no release date set)
                    </p>
                  )}
                </div>

                {/* Date and Time Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-semibold">
                      Release Date
                    </label>
                    <input
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 font-semibold">
                      Release Time
                    </label>
                    <input
                      type="time"
                      value={releaseTime}
                      onChange={(e) => setReleaseTime(e.target.value)}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveReleaseDate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                  >
                    Set Release Date/Time
                  </button>
                  {selectedSession.result_release_date && (
                    <button
                      onClick={handleClearReleaseDate}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
                    >
                      Clear & Release Now
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ How it works:</h4>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>Set a future date and time when you want results to be visible</li>
          <li>Before that time, students will see a notification with the release date</li>
          <li>After the set time, results automatically become visible</li>
          <li>Click "Clear & Release Now" to make results visible immediately</li>
          <li>If no release date is set, results are always visible</li>
        </ul>
      </div>
    </div>
  );
};

export default ResultReleaseManager;
